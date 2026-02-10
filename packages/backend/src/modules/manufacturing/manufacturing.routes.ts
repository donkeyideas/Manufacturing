import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { billOfMaterials, bomComponents, workOrders, items } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';

export const manufacturingRouter = Router();
manufacturingRouter.use(requireAuth);

// ─── Bills of Materials ───

manufacturingRouter.get(
  '/boms',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select({
        id: billOfMaterials.id,
        bomNumber: billOfMaterials.bomNumber,
        bomName: billOfMaterials.bomName,
        finishedItemId: billOfMaterials.finishedItemId,
        revision: billOfMaterials.revision,
        isActive: billOfMaterials.isActive,
        outputQuantity: billOfMaterials.outputQuantity,
        notes: billOfMaterials.notes,
        createdAt: billOfMaterials.createdAt,
        itemNumber: items.itemNumber,
        itemName: items.itemName,
      })
      .from(billOfMaterials)
      .leftJoin(items, eq(billOfMaterials.finishedItemId, items.id))
      .where(eq(billOfMaterials.tenantId, user!.tenantId))
      .orderBy(billOfMaterials.bomNumber);

    res.json({ success: true, data: rows });
  }),
);

manufacturingRouter.get(
  '/boms/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [bom] = await db
      .select()
      .from(billOfMaterials)
      .where(and(eq(billOfMaterials.id, id), eq(billOfMaterials.tenantId, user!.tenantId)))
      .limit(1);

    if (!bom) throw new AppError(404, 'BOM not found');

    const components = await db
      .select({
        id: bomComponents.id,
        componentItemId: bomComponents.componentItemId,
        quantityRequired: bomComponents.quantityRequired,
        unitOfMeasure: bomComponents.unitOfMeasure,
        wastePercent: bomComponents.wastePercent,
        lineNumber: bomComponents.lineNumber,
        itemNumber: items.itemNumber,
        itemName: items.itemName,
      })
      .from(bomComponents)
      .leftJoin(items, eq(bomComponents.componentItemId, items.id))
      .where(eq(bomComponents.bomId, id))
      .orderBy(bomComponents.lineNumber);

    res.json({ success: true, data: { ...bom, components } });
  }),
);

manufacturingRouter.post(
  '/boms',
  validateBody({
    bomName: { required: true, type: 'string', maxLength: 255 },
    finishedItemId: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { bomName, finishedItemId, revision, outputQuantity, notes, components } = req.body;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(billOfMaterials)
      .where(eq(billOfMaterials.tenantId, user!.tenantId));
    const bomNumber = `BOM-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    const [bom] = await db.insert(billOfMaterials).values({
      tenantId: user!.tenantId,
      bomNumber,
      bomName,
      finishedItemId,
      revision: revision || 'A',
      outputQuantity: String(outputQuantity || 1),
      notes,
    }).returning();

    if (components && Array.isArray(components)) {
      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        await db.insert(bomComponents).values({
          bomId: bom.id,
          componentItemId: comp.componentItemId,
          quantityRequired: String(comp.quantityRequired),
          unitOfMeasure: comp.unitOfMeasure || 'EA',
          wastePercent: String(comp.wastePercent || 0),
          lineNumber: i + 1,
        });
      }
    }

    res.status(201).json({ success: true, data: bom });
  }),
);

// ─── Work Orders ───

manufacturingRouter.get(
  '/work-orders',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        status: workOrders.status,
        quantityOrdered: workOrders.quantityOrdered,
        quantityCompleted: workOrders.quantityCompleted,
        plannedStartDate: workOrders.plannedStartDate,
        plannedEndDate: workOrders.plannedEndDate,
        actualStartDate: workOrders.actualStartDate,
        actualEndDate: workOrders.actualEndDate,
        priority: workOrders.priority,
        notes: workOrders.notes,
        createdAt: workOrders.createdAt,
        itemNumber: items.itemNumber,
        itemName: items.itemName,
      })
      .from(workOrders)
      .leftJoin(items, eq(workOrders.itemId, items.id))
      .where(eq(workOrders.tenantId, user!.tenantId))
      .orderBy(desc(workOrders.createdAt));

    res.json({ success: true, data: rows });
  }),
);

manufacturingRouter.post(
  '/work-orders',
  validateBody({
    itemId: { required: true, type: 'string' },
    quantityOrdered: { required: true, type: 'number' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { itemId, bomId, quantityOrdered, plannedStartDate, plannedEndDate, priority, notes } = req.body;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(workOrders)
      .where(eq(workOrders.tenantId, user!.tenantId));
    const woNumber = `WO-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    const [wo] = await db.insert(workOrders).values({
      tenantId: user!.tenantId,
      woNumber,
      itemId,
      bomId,
      quantityOrdered: String(quantityOrdered),
      plannedStartDate,
      plannedEndDate,
      priority: priority || 'normal',
      notes,
      createdBy: user!.userId,
    }).returning();

    res.status(201).json({ success: true, data: wo });
  }),
);

manufacturingRouter.put(
  '/work-orders/:id/status',
  validateBody({ status: { required: true, type: 'string' } }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { status } = req.body;

    const updates: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === 'in_progress' || status === 'released') {
      updates.actualStartDate = new Date().toISOString().split('T')[0];
    }
    if (status === 'completed' || status === 'closed') {
      updates.actualEndDate = new Date().toISOString().split('T')[0];
    }

    const [updated] = await db
      .update(workOrders)
      .set(updates)
      .where(and(eq(workOrders.id, id), eq(workOrders.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Work order not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Manufacturing Overview / KPIs ───

manufacturingRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const bomCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(billOfMaterials)
      .where(and(eq(billOfMaterials.tenantId, user!.tenantId), eq(billOfMaterials.isActive, true)));

    const woStats = await db
      .select({ count: sql<number>`count(*)` })
      .from(workOrders)
      .where(eq(workOrders.tenantId, user!.tenantId));

    const activeWOs = await db
      .select({ count: sql<number>`count(*)` })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.tenantId, user!.tenantId),
          sql`${workOrders.status} IN ('released', 'in_progress')`,
        ),
      );

    const completedWOs = await db
      .select({ count: sql<number>`count(*)` })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.tenantId, user!.tenantId),
          sql`${workOrders.status} IN ('completed', 'closed')`,
        ),
      );

    res.json({
      success: true,
      data: {
        activeBOMs: Number(bomCount[0].count),
        totalWorkOrders: Number(woStats[0].count),
        activeWorkOrders: Number(activeWOs[0].count),
        completedWorkOrders: Number(completedWOs[0].count),
      },
    });
  }),
);
