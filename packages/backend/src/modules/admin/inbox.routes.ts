import { Router } from 'express';
import { eq, desc, count, ilike, or } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { contactMessages } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { validateBody } from '../../core/validate.js';
import { requireAdmin } from './adminAuth.js';

export const inboxRouter = Router();

// GET /api/admin/inbox
inboxRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json({ success: true, data: messages });
  }),
);

// POST /api/admin/inbox  (create a message — used by public contact form)
inboxRouter.post(
  '/',
  validateBody({
    sender: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    subject: { required: true, type: 'string' },
    body: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { sender, email, company, phone, location, subject, body } = req.body;
    const [msg] = await db.insert(contactMessages).values({
      sender, email, subject, body,
      company: company ?? null,
      phone: phone ?? null,
      location: location ?? null,
    }).returning();
    res.status(201).json({ success: true, data: msg });
  }),
);

// PATCH /api/admin/inbox/:id
inboxRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (req.body.isRead !== undefined) updates.isRead = req.body.isRead;
    if (req.body.isStarred !== undefined) updates.isStarred = req.body.isStarred;
    if (req.body.status) updates.status = req.body.status;

    const [updated] = await db
      .update(contactMessages)
      .set(updates)
      .where(eq(contactMessages.id, id))
      .returning();
    if (!updated) throw new AppError(404, 'Message not found');
    res.json({ success: true, data: updated });
  }),
);

// PATCH /api/admin/inbox/mark-all-read
inboxRouter.patch(
  '/mark-all-read',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    await db
      .update(contactMessages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(contactMessages.isRead, false));
    res.json({ success: true });
  }),
);

// DELETE /api/admin/inbox/:id
inboxRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    res.json({ success: true });
  }),
);
