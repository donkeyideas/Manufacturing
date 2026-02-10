import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { sops, sopRevisions, sopAcknowledgments } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';

export const sopRouter = Router();
sopRouter.use(requireAuth);

// ─── List SOPs ───

sopRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const rows = await db
      .select()
      .from(sops)
      .where(eq(sops.tenantId, user!.tenantId))
      .orderBy(desc(sops.updatedAt));

    res.json({ success: true, data: rows });
  }),
);

// ─── Get Acknowledgments ───
// NOTE: This route is defined BEFORE /:id to avoid matching "acknowledgments" as an id param.

sopRouter.get(
  '/acknowledgments',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Get acknowledgments for SOPs belonging to this tenant
    const tenantSops = await db
      .select({ id: sops.id })
      .from(sops)
      .where(eq(sops.tenantId, user!.tenantId));

    const sopIds = tenantSops.map((s) => s.id);

    if (sopIds.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    // Fetch acknowledgments for all tenant SOPs
    const acknowledgments = [];
    for (const sopId of sopIds) {
      const rows = await db
        .select()
        .from(sopAcknowledgments)
        .where(eq(sopAcknowledgments.sopId, sopId))
        .orderBy(desc(sopAcknowledgments.acknowledgedAt));
      acknowledgments.push(...rows);
    }

    res.json({ success: true, data: acknowledgments });
  }),
);

// ─── Get Single SOP ───

sopRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [sop] = await db
      .select()
      .from(sops)
      .where(and(eq(sops.id, id), eq(sops.tenantId, user!.tenantId)))
      .limit(1);

    if (!sop) throw new AppError(404, 'SOP not found');

    // Include revision history
    const revisions = await db
      .select()
      .from(sopRevisions)
      .where(eq(sopRevisions.sopId, id))
      .orderBy(desc(sopRevisions.revisionNumber));

    // Include acknowledgments for this SOP
    const acknowledgments = await db
      .select()
      .from(sopAcknowledgments)
      .where(eq(sopAcknowledgments.sopId, id))
      .orderBy(desc(sopAcknowledgments.acknowledgedAt));

    res.json({ success: true, data: { ...sop, revisions, acknowledgments } });
  }),
);

// ─── Create SOP ───

sopRouter.post(
  '/',
  validateBody({
    title: { required: true, type: 'string', maxLength: 500 },
    department: { required: true, type: 'string', maxLength: 100 },
    content: { required: true, type: 'string' },
    hazardLevel: { required: false, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { title, department, content, hazardLevel, equipmentInvolved } = req.body;

    // Generate SOP number
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sops)
      .where(eq(sops.tenantId, user!.tenantId));
    const sopNumber = `SOP-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    const [sop] = await db.insert(sops).values({
      tenantId: user!.tenantId,
      sopNumber,
      title,
      department,
      content,
      hazardLevel: hazardLevel || 'none',
      equipmentInvolved: equipmentInvolved ? JSON.stringify(equipmentInvolved) : null,
      createdBy: user!.userId,
    }).returning();

    // Create initial revision
    await db.insert(sopRevisions).values({
      sopId: sop.id,
      revisionNumber: 1,
      content,
      changeDescription: 'Initial version',
      createdBy: user!.userId,
    });

    res.status(201).json({ success: true, data: sop });
  }),
);

// ─── Update SOP ───

sopRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { title, department, content, hazardLevel, status, equipmentInvolved, changeDescription } = req.body;

    // Fetch current SOP
    const [current] = await db
      .select()
      .from(sops)
      .where(and(eq(sops.id, id), eq(sops.tenantId, user!.tenantId)))
      .limit(1);

    if (!current) throw new AppError(404, 'SOP not found');

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (department !== undefined) updates.department = department;
    if (hazardLevel !== undefined) updates.hazardLevel = hazardLevel;
    if (status !== undefined) updates.status = status;
    if (equipmentInvolved !== undefined) updates.equipmentInvolved = JSON.stringify(equipmentInvolved);

    // If content changed, create a new revision
    if (content !== undefined && content !== current.content) {
      const newRevisionNumber = (current.currentRevision ?? 1) + 1;
      updates.content = content;
      updates.currentRevision = newRevisionNumber;

      await db.insert(sopRevisions).values({
        sopId: id,
        revisionNumber: newRevisionNumber,
        content,
        changeDescription: changeDescription || `Revision ${newRevisionNumber}`,
        createdBy: user!.userId,
      });
    }

    if (status === 'active' && current.status !== 'active') {
      updates.approvedBy = user!.userId;
      updates.approvedAt = new Date();
    }

    const [updated] = await db
      .update(sops)
      .set(updates)
      .where(eq(sops.id, id))
      .returning();

    res.json({ success: true, data: updated });
  }),
);

// ─── Acknowledge SOP ───

sopRouter.post(
  '/:id/acknowledge',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { notes } = req.body;

    // Verify SOP exists and belongs to tenant
    const [sop] = await db
      .select()
      .from(sops)
      .where(and(eq(sops.id, id), eq(sops.tenantId, user!.tenantId)))
      .limit(1);

    if (!sop) throw new AppError(404, 'SOP not found');

    // Check if already acknowledged for this revision
    const [existing] = await db
      .select()
      .from(sopAcknowledgments)
      .where(
        and(
          eq(sopAcknowledgments.sopId, id),
          eq(sopAcknowledgments.userId, user!.userId),
          eq(sopAcknowledgments.revisionNumber, sop.currentRevision ?? 1),
        ),
      )
      .limit(1);

    if (existing) throw new AppError(409, 'You have already acknowledged this revision');

    const [acknowledgment] = await db.insert(sopAcknowledgments).values({
      sopId: id,
      userId: user!.userId,
      revisionNumber: sop.currentRevision ?? 1,
      notes: notes || null,
    }).returning();

    res.status(201).json({ success: true, data: acknowledgment });
  }),
);
