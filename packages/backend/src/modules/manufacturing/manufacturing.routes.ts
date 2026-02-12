import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { billOfMaterials, bomComponents, workOrders, items, workCenters, routings, routingOperations } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { bomImportSchema, workOrderImportSchema, workCenterImportSchema, routingImportSchema } from '@erp/shared';

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

// ─── Work Centers ───

manufacturingRouter.get(
  '/work-centers',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(workCenters)
      .where(eq(workCenters.tenantId, user!.tenantId))
      .orderBy(workCenters.workCenterCode);

    res.json({ success: true, data: rows });
  }),
);

manufacturingRouter.get(
  '/work-centers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [wc] = await db
      .select()
      .from(workCenters)
      .where(and(eq(workCenters.id, String(req.params.id)), eq(workCenters.tenantId, user!.tenantId)))
      .limit(1);

    if (!wc) throw new AppError(404, 'Work center not found');
    res.json({ success: true, data: wc });
  }),
);

manufacturingRouter.post(
  '/work-centers',
  validateBody({
    workCenterCode: { required: true, type: 'string', maxLength: 50 },
    workCenterName: { required: true, type: 'string', maxLength: 200 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const {
      workCenterCode, workCenterName, description, location,
      hourlyRate, efficiencyPercent, capacityHoursPerDay, setupTimeMinutes,
    } = req.body;

    const [wc] = await db.insert(workCenters).values({
      tenantId: user!.tenantId,
      workCenterCode,
      workCenterName,
      description: description || null,
      location: location || null,
      hourlyRate: hourlyRate ? String(hourlyRate) : null,
      efficiencyPercent: String(efficiencyPercent || 100),
      capacityHoursPerDay: String(capacityHoursPerDay || 8),
      setupTimeMinutes: setupTimeMinutes || null,
    }).returning();

    res.status(201).json({ success: true, data: wc });
  }),
);

manufacturingRouter.put(
  '/work-centers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const {
      workCenterName, description, location, hourlyRate,
      efficiencyPercent, capacityHoursPerDay, setupTimeMinutes, isActive,
    } = req.body;

    const [updated] = await db
      .update(workCenters)
      .set({
        workCenterName, description, location, setupTimeMinutes, isActive,
        hourlyRate: hourlyRate !== undefined ? String(hourlyRate) : undefined,
        efficiencyPercent: efficiencyPercent !== undefined ? String(efficiencyPercent) : undefined,
        capacityHoursPerDay: capacityHoursPerDay !== undefined ? String(capacityHoursPerDay) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(workCenters.id, id), eq(workCenters.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Work center not found');
    res.json({ success: true, data: updated });
  }),
);

manufacturingRouter.delete(
  '/work-centers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(workCenters)
      .where(and(eq(workCenters.id, id), eq(workCenters.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Work center not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Routings ───

manufacturingRouter.get(
  '/routings',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(routings)
      .where(eq(routings.tenantId, user!.tenantId))
      .orderBy(routings.routingNumber);

    res.json({ success: true, data: rows });
  }),
);

manufacturingRouter.post(
  '/routings',
  validateBody({
    routingName: { required: true, type: 'string', maxLength: 200 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { routingName, finishedItemId, operations } = req.body;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(routings)
      .where(eq(routings.tenantId, user!.tenantId));
    const routingNumber = `RTG-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    const [routing] = await db.insert(routings).values({
      tenantId: user!.tenantId,
      routingNumber,
      routingName,
      finishedItemId: finishedItemId || null,
    }).returning();

    if (operations && Array.isArray(operations)) {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        await db.insert(routingOperations).values({
          routingId: routing.id,
          operationSequence: op.operationSequence || (i + 1) * 10,
          operationName: op.operationName,
          workCenterId: op.workCenterId || null,
          setupTime: op.setupTime ? String(op.setupTime) : null,
          runTime: op.runTime ? String(op.runTime) : null,
          description: op.description || null,
          lineNumber: i + 1,
        });
      }
    }

    res.status(201).json({ success: true, data: routing });
  }),
);

manufacturingRouter.delete(
  '/routings/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    await db.delete(routingOperations).where(eq(routingOperations.routingId, id));
    const [deleted] = await db
      .delete(routings)
      .where(and(eq(routings.id, id), eq(routings.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Routing not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Work Orders: Update ───

manufacturingRouter.put(
  '/work-orders/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { quantityOrdered, plannedStartDate, plannedEndDate, priority, notes, status } = req.body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (quantityOrdered !== undefined) updates.quantityOrdered = String(quantityOrdered);
    if (plannedStartDate !== undefined) updates.plannedStartDate = plannedStartDate;
    if (plannedEndDate !== undefined) updates.plannedEndDate = plannedEndDate;
    if (priority !== undefined) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    const [updated] = await db
      .update(workOrders)
      .set(updates)
      .where(and(eq(workOrders.id, id), eq(workOrders.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Work order not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Work Orders: Delete ───

manufacturingRouter.delete(
  '/work-orders/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(workOrders)
      .where(and(eq(workOrders.id, id), eq(workOrders.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Work order not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Production Tracking (derived from work orders) ───
manufacturingRouter.get(
  '/production-tracking',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const rows = await db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        status: workOrders.status,
        quantityOrdered: workOrders.quantityOrdered,
        quantityCompleted: workOrders.quantityCompleted,
        priority: workOrders.priority,
        plannedStartDate: workOrders.plannedStartDate,
        plannedEndDate: workOrders.plannedEndDate,
        actualStartDate: workOrders.actualStartDate,
        actualEndDate: workOrders.actualEndDate,
        itemName: items.itemName,
        itemNumber: items.itemNumber,
      })
      .from(workOrders)
      .leftJoin(items, eq(workOrders.itemId, items.id))
      .where(eq(workOrders.tenantId, user!.tenantId))
      .orderBy(desc(workOrders.createdAt));

    const tracking = rows.map((row) => {
      const qtyOrdered = Number(row.quantityOrdered || 0);
      const qtyCompleted = Number(row.quantityCompleted || 0);
      const completionPercent = qtyOrdered > 0 ? Math.round((qtyCompleted / qtyOrdered) * 100) : 0;
      return {
        id: row.id,
        workOrderNumber: row.woNumber,
        productName: row.itemName || row.itemNumber || '-',
        status: row.status || 'planned',
        currentStep: row.status === 'completed' ? 'Done' : row.status === 'in_progress' ? 'In Progress' : row.status || '-',
        completionPercent,
        quantityPlanned: qtyOrdered,
        quantityCompleted: qtyCompleted,
        quantityScrap: 0,
        operator: null,
        workCenter: null,
        priority: row.priority,
        startDate: row.plannedStartDate,
        dueDate: row.plannedEndDate,
      };
    });

    res.json({ success: true, data: tracking });
  }),
);

// ─── Quality Records (stub) ───
manufacturingRouter.get('/quality-records', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

// ─── Bulk Import ───

manufacturingRouter.post('/work-centers/import', requireAuth, createImportHandler(workCenterImportSchema, async (rows, tenantId) => {
  await db.insert(workCenters).values(
    rows.map(row => ({
      tenantId,
      workCenterCode: String(row.workCenterCode),
      workCenterName: String(row.workCenterName),
      description: row.description ? String(row.description) : null,
      location: row.location ? String(row.location) : null,
      hourlyRate: row.hourlyRate ? String(row.hourlyRate) : null,
      efficiencyPercent: String(row.efficiencyPercent || 100),
      capacityHoursPerDay: String(row.capacityHoursPerDay || 8),
      setupTimeMinutes: row.setupTimeMinutes ? Number(row.setupTimeMinutes) : null,
      isActive: row.isActive !== false,
    }))
  );
}));

manufacturingRouter.post('/boms/import', requireAuth, createImportHandler(bomImportSchema, async (rows, tenantId) => {
  // Group rows by BOM number
  const bomMap = new Map<string, typeof rows>();
  for (const row of rows) {
    const bomNumber = String(row.bomNumber);
    if (!bomMap.has(bomNumber)) {
      bomMap.set(bomNumber, []);
    }
    bomMap.get(bomNumber)!.push(row);
  }

  // Process each BOM
  for (const [bomNumber, bomRows] of bomMap) {
    const firstRow = bomRows[0];

    // Find finished item by item number
    const [finishedItem] = await db
      .select()
      .from(items)
      .where(and(eq(items.itemNumber, String(firstRow.finishedItemNumber)), eq(items.tenantId, tenantId)))
      .limit(1);

    if (!finishedItem) continue; // Skip if finished item not found

    // Insert BOM header
    const [bom] = await db.insert(billOfMaterials).values({
      tenantId,
      bomNumber,
      bomName: String(firstRow.bomName),
      finishedItemId: finishedItem.id,
      revision: String(firstRow.version || 'A'),
      isActive: firstRow.isActive !== false,
      outputQuantity: '1',
    }).returning();

    // Insert BOM components
    for (let i = 0; i < bomRows.length; i++) {
      const row = bomRows[i];
      const componentItemNumber = String(row.componentItemNumber);

      // Find component item by item number
      const [componentItem] = await db
        .select()
        .from(items)
        .where(and(eq(items.itemNumber, componentItemNumber), eq(items.tenantId, tenantId)))
        .limit(1);

      if (!componentItem) continue; // Skip if component not found

      await db.insert(bomComponents).values({
        bomId: bom.id,
        componentItemId: componentItem.id,
        quantityRequired: String(row.quantityRequired),
        unitOfMeasure: String(row.unitOfMeasure || 'EA'),
        wastePercent: String(row.scrapPercent || 0),
        lineNumber: i + 1,
      });
    }
  }
}));

manufacturingRouter.post('/routings/import', requireAuth, createImportHandler(routingImportSchema, async (rows, tenantId) => {
  for (const row of rows) {
    let finishedItemId = null;
    if (row.finishedItemNumber) {
      const [item] = await db
        .select()
        .from(items)
        .where(and(eq(items.itemNumber, String(row.finishedItemNumber)), eq(items.tenantId, tenantId)))
        .limit(1);
      if (item) finishedItemId = item.id;
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(routings)
      .where(eq(routings.tenantId, tenantId));
    const routingNumber = row.routingNumber
      ? String(row.routingNumber)
      : `RTG-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    await db.insert(routings).values({
      tenantId,
      routingNumber,
      routingName: String(row.routingName),
      finishedItemId,
    });
  }
}));

manufacturingRouter.post('/work-orders/import', requireAuth, createImportHandler(workOrderImportSchema, async (rows, tenantId) => {
  for (const row of rows) {
    const itemNumber = String(row.finishedItemNumber);

    // Find item by item number
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.itemNumber, itemNumber), eq(items.tenantId, tenantId)))
      .limit(1);

    if (!item) continue; // Skip if item not found

    // Find BOM by BOM number if provided
    let bomId = null;
    if (row.bomNumber) {
      const [bom] = await db
        .select()
        .from(billOfMaterials)
        .where(and(eq(billOfMaterials.bomNumber, String(row.bomNumber)), eq(billOfMaterials.tenantId, tenantId)))
        .limit(1);
      if (bom) bomId = bom.id;
    }

    const status = String(row.status || 'planned') as 'planned' | 'released' | 'in_progress' | 'completed' | 'closed' | 'cancelled';
    const priority = String(row.priority || 'normal');
    await db.insert(workOrders).values({
      tenantId,
      woNumber: String(row.workOrderNumber),
      itemId: item.id,
      bomId,
      status,
      quantityOrdered: String(row.quantityOrdered),
      quantityCompleted: '0',
      plannedStartDate: row.startDate ? String(row.startDate) : null,
      plannedEndDate: row.dueDate ? String(row.dueDate) : null,
      priority,
      notes: row.notes ? String(row.notes) : null,
    });
  }
}));
