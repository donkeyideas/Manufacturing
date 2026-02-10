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
        warehouseCode: warehouses.warehouseCode,
        warehouseName: warehouses.warehouseName,
      })
      .from(inventoryOnHand)
      .innerJoin(items, eq(inventoryOnHand.itemId, items.id))
      .innerJoin(warehouses, eq(inventoryOnHand.warehouseId, warehouses.id))
      .where(eq(inventoryOnHand.tenantId, user!.tenantId));

    res.json({ success: true, data: rows });
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
