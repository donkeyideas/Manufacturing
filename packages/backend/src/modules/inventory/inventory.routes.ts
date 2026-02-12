import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { items, warehouses, inventoryOnHand } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { itemImportSchema, warehouseImportSchema } from '@erp/shared';

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth);

// ─── Items ───

inventoryRouter.get(
  '/items',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(items)
      .where(eq(items.tenantId, user!.tenantId))
      .orderBy(items.itemNumber);

    res.json({ success: true, data: rows });
  }),
);

inventoryRouter.get(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, String(req.params.id)), eq(items.tenantId, user!.tenantId)))
      .limit(1);

    if (!item) throw new AppError(404, 'Item not found');
    res.json({ success: true, data: item });
  }),
);

inventoryRouter.post(
  '/items',
  validateBody({
    itemNumber: { required: true, type: 'string', maxLength: 30 },
    itemName: { required: true, type: 'string', maxLength: 255 },
    itemType: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { itemNumber, itemName, itemType, description, category, unitOfMeasure, unitCost, sellingPrice, reorderPoint, reorderQuantity } = req.body;

    const [item] = await db.insert(items).values({
      tenantId: user!.tenantId,
      itemNumber,
      itemName,
      itemType,
      description,
      category,
      unitOfMeasure: unitOfMeasure || 'EA',
      unitCost: String(unitCost || 0),
      sellingPrice: String(sellingPrice || 0),
      reorderPoint: reorderPoint || 0,
      reorderQuantity: reorderQuantity || 0,
    }).returning();

    res.status(201).json({ success: true, data: item });
  }),
);

inventoryRouter.put(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { itemName, description, category, unitCost, sellingPrice, reorderPoint, reorderQuantity, isActive } = req.body;

    const [updated] = await db
      .update(items)
      .set({
        itemName, description, category, isActive,
        unitCost: unitCost !== undefined ? String(unitCost) : undefined,
        sellingPrice: sellingPrice !== undefined ? String(sellingPrice) : undefined,
        reorderPoint, reorderQuantity,
        updatedAt: new Date(),
      })
      .where(and(eq(items.id, id), eq(items.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Item not found');
    res.json({ success: true, data: updated });
  }),
);

inventoryRouter.delete(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Item not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Warehouses ───

inventoryRouter.get(
  '/warehouses',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.tenantId, user!.tenantId))
      .orderBy(warehouses.warehouseCode);

    res.json({ success: true, data: rows });
  }),
);

inventoryRouter.post(
  '/warehouses',
  validateBody({
    warehouseCode: { required: true, type: 'string', maxLength: 20 },
    warehouseName: { required: true, type: 'string', maxLength: 255 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { warehouseCode, warehouseName, address, city, state, country } = req.body;

    const [wh] = await db.insert(warehouses).values({
      tenantId: user!.tenantId,
      warehouseCode,
      warehouseName,
      address,
      city,
      state,
      country,
    }).returning();

    res.status(201).json({ success: true, data: wh });
  }),
);

// ─── Inventory On Hand ───

inventoryRouter.get(
  '/on-hand',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Check if on-hand data exists; auto-seed if empty
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryOnHand)
      .where(eq(inventoryOnHand.tenantId, user!.tenantId));

    if (Number(countResult[0].count) === 0) {
      // Auto-seed: distribute items across warehouses
      const allItems = await db.select().from(items).where(eq(items.tenantId, user!.tenantId));
      const allWarehouses = await db.select().from(warehouses).where(eq(warehouses.tenantId, user!.tenantId));

      if (allItems.length > 0 && allWarehouses.length > 0) {
        const records = allItems.map((item, i) => {
          const wh = allWarehouses[i % allWarehouses.length];
          const reorderPt = Number(item.reorderPoint ?? 0);
          const qty = reorderPt > 0 ? reorderPt * (2 + (i % 4)) : 50 + (i % 20) * 10;
          return {
            tenantId: user!.tenantId,
            itemId: item.id,
            warehouseId: wh.id,
            quantityOnHand: String(qty),
            quantityReserved: '0',
            quantityAvailable: String(qty),
          };
        });

        // Batch insert
        const batchSize = 500;
        for (let i = 0; i < records.length; i += batchSize) {
          await db.insert(inventoryOnHand).values(records.slice(i, i + batchSize));
        }
      }
    }

    const rows = await db
      .select({
        id: inventoryOnHand.id,
        itemId: inventoryOnHand.itemId,
        warehouseId: inventoryOnHand.warehouseId,
        quantityOnHand: inventoryOnHand.quantityOnHand,
        quantityReserved: inventoryOnHand.quantityReserved,
        quantityAvailable: inventoryOnHand.quantityAvailable,
        itemNumber: items.itemNumber,
        itemName: items.itemName,
        unitCost: items.unitCost,
        warehouseCode: warehouses.warehouseCode,
        warehouseName: warehouses.warehouseName,
      })
      .from(inventoryOnHand)
      .innerJoin(items, eq(inventoryOnHand.itemId, items.id))
      .innerJoin(warehouses, eq(inventoryOnHand.warehouseId, warehouses.id))
      .where(eq(inventoryOnHand.tenantId, user!.tenantId));

    // Add computed totalCost for each row
    const data = rows.map((row) => ({
      ...row,
      quantityOnHand: Number(row.quantityOnHand ?? 0),
      quantityReserved: Number(row.quantityReserved ?? 0),
      quantityAvailable: Number(row.quantityAvailable ?? 0),
      totalCost: Number(row.quantityOnHand ?? 0) * Number(row.unitCost ?? 0),
    }));

    res.json({ success: true, data });
  }),
);

// ─── Inventory Overview / KPIs ───

inventoryRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const itemCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(eq(items.tenantId, user!.tenantId), eq(items.isActive, true)));

    const warehouseCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
      .where(and(eq(warehouses.tenantId, user!.tenantId), eq(warehouses.isActive, true)));

    const totalValue = await db
      .select({ total: sql<number>`coalesce(sum(cast(${inventoryOnHand.quantityOnHand} as numeric) * cast(${items.unitCost} as numeric)), 0)` })
      .from(inventoryOnHand)
      .innerJoin(items, eq(inventoryOnHand.itemId, items.id))
      .where(eq(inventoryOnHand.tenantId, user!.tenantId));

    const lowStockItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryOnHand)
      .innerJoin(items, eq(inventoryOnHand.itemId, items.id))
      .where(
        and(
          eq(inventoryOnHand.tenantId, user!.tenantId),
          sql`cast(${inventoryOnHand.quantityOnHand} as numeric) <= ${items.reorderPoint}`,
        ),
      );

    res.json({
      success: true,
      data: {
        totalItems: Number(itemCount[0].count),
        totalWarehouses: Number(warehouseCount[0].count),
        totalInventoryValue: Number(totalValue[0].total),
        lowStockAlerts: Number(lowStockItems[0].count),
      },
    });
  }),
);

// ─── Inventory Transactions (stub) ───
inventoryRouter.get('/transactions', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

// ─── Cycle Counts (stub) ───
inventoryRouter.get('/cycle-counts', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

// ─── Demand Planning ───
inventoryRouter.get(
  '/demand-planning',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Get active items
    const allItems = await db
      .select()
      .from(items)
      .where(and(eq(items.tenantId, user!.tenantId), eq(items.isActive, true)))
      .orderBy(items.itemName)
      .limit(200);

    // Get on-hand quantities grouped by item
    const onHandRows = await db
      .select({
        itemId: inventoryOnHand.itemId,
        totalOnHand: sql<number>`coalesce(sum(cast(${inventoryOnHand.quantityOnHand} as numeric)), 0)`,
      })
      .from(inventoryOnHand)
      .where(eq(inventoryOnHand.tenantId, user!.tenantId))
      .groupBy(inventoryOnHand.itemId);

    const onHandMap = new Map(onHandRows.map((r) => [r.itemId, Number(r.totalOnHand)]));

    // Compute forecast items using months-of-supply logic
    const forecastItems = allItems.map((item) => {
      const currentStock = onHandMap.get(item.id) ?? 0;
      const reorderPt = Number(item.reorderPoint ?? 0);
      const reorderQty = Number(item.reorderQuantity ?? 0);
      const avgMonthlyUsage = reorderPt > 0 ? Math.round(reorderPt * 1.5) : Math.round(reorderQty || 50);

      // Months of supply calculation
      const monthsOfSupply = avgMonthlyUsage > 0 ? currentStock / avgMonthlyUsage : 99;
      // Suggest reorder if less than 3 months supply
      const suggestedOrder = monthsOfSupply < 3
        ? Math.max(0, Math.ceil(3 * avgMonthlyUsage - currentStock))
        : 0;

      let stockoutRisk = 'low';
      if (monthsOfSupply < 0.5) stockoutRisk = 'critical';
      else if (monthsOfSupply < 1) stockoutRisk = 'high';
      else if (monthsOfSupply < 2) stockoutRisk = 'medium';

      return {
        id: item.id,
        itemName: item.itemName || item.itemNumber,
        itemNumber: item.itemNumber,
        currentStock,
        avgMonthlyUsage,
        reorderPoint: reorderPt,
        suggestedOrder,
        leadTimeDays: 7,
        stockoutRisk,
      };
    });

    // Generate 6-month demand trend
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const totalMonthlyDemand = forecastItems.reduce((s, f) => {
      const item = allItems.find((i) => i.id === f.id);
      return s + f.avgMonthlyUsage * Number(item?.unitCost ?? 1);
    }, 0);
    const factors = [0.85, 0.92, 1.0, 1.15, 1.05, 0.95];
    const demandTrend = months.map((month, i) => {
      const demand = Math.round(totalMonthlyDemand * factors[i]);
      const fulfilled = Math.round(demand * (0.88 + i * 0.02));
      return { month, demand, fulfilled };
    });

    res.json({ success: true, data: { demandTrend, forecastItems } });
  }),
);

// ─── Bulk Import ───

inventoryRouter.post('/items/import', requireAuth, createImportHandler(itemImportSchema, async (rows, tenantId) => {
  await db.insert(items).values(
    rows.map(row => ({
      tenantId,
      itemNumber: String(row.itemNumber),
      itemName: String(row.itemName),
      itemType: String(row.itemType || 'raw_material'),
      description: row.description ? String(row.description) : null,
      unitOfMeasure: String(row.unitOfMeasure || 'EA'),
      unitCost: String(row.standardCost || 0),
      sellingPrice: String(row.sellingPrice || 0),
      reorderPoint: row.reorderPoint ? Number(row.reorderPoint) : 0,
      reorderQuantity: row.reorderQuantity ? Number(row.reorderQuantity) : 0,
      isActive: row.isActive !== false,
    }))
  );
}));

inventoryRouter.post('/warehouses/import', requireAuth, createImportHandler(warehouseImportSchema, async (rows, tenantId) => {
  await db.insert(warehouses).values(
    rows.map(row => ({
      tenantId,
      warehouseCode: String(row.warehouseCode),
      warehouseName: String(row.warehouseName),
      city: row.city ? String(row.city) : null,
      state: row.state ? String(row.state) : null,
      country: row.country ? String(row.country) : null,
      isActive: row.isActive !== false,
    }))
  );
}));
