import { Router } from 'express';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import {
  users,
  shiftSchedules,
  companyAnnouncements,
  trainingCertifications,
} from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';

export const portalRouter = Router();
portalRouter.use(requireAuth);

// ─── Get Employee Profile ───

portalRouter.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user!.userId))
      .limit(1);

    if (!profile) throw new AppError(404, 'Profile not found');

    res.json({ success: true, data: profile });
  }),
);

// ─── Clock In ───

portalRouter.post(
  '/clock-in',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if already clocked in today (no end time on an existing shift)
    const [activeShift] = await db
      .select()
      .from(shiftSchedules)
      .where(
        and(
          eq(shiftSchedules.userId, user!.userId),
          eq(shiftSchedules.shiftDate, today),
        ),
      )
      .limit(1);

    if (activeShift && activeShift.notes?.includes('clocked_in')) {
      throw new AppError(400, 'You are already clocked in for today');
    }

    const timeStr = now.toTimeString().slice(0, 5); // HH:MM

    const [shift] = await db.insert(shiftSchedules).values({
      tenantId: user!.tenantId,
      userId: user!.userId,
      shiftType: 'flexible',
      shiftDate: today,
      startTime: timeStr,
      endTime: '--:--', // Will be set on clock-out
      notes: 'clocked_in',
    }).returning();

    res.status(201).json({
      success: true,
      data: shift,
      message: `Clocked in at ${timeStr}`,
    });
  }),
);

// ─── Clock Out ───

portalRouter.post(
  '/clock-out',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Find today's active clock-in entry
    const [activeShift] = await db
      .select()
      .from(shiftSchedules)
      .where(
        and(
          eq(shiftSchedules.userId, user!.userId),
          eq(shiftSchedules.shiftDate, today),
          eq(shiftSchedules.endTime, '--:--'),
        ),
      )
      .limit(1);

    if (!activeShift) {
      throw new AppError(400, 'No active clock-in found for today');
    }

    const [updated] = await db
      .update(shiftSchedules)
      .set({
        endTime: timeStr,
        notes: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(shiftSchedules.id, activeShift.id))
      .returning();

    res.json({
      success: true,
      data: updated,
      message: `Clocked out at ${timeStr}`,
    });
  }),
);

// ─── Get Pay Stubs ───
// Returns a placeholder structure since payroll tables are not yet implemented.

portalRouter.get(
  '/pay-stubs',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Placeholder: real implementation would query a payroll/pay_stubs table
    res.json({
      success: true,
      data: [],
      message: 'Pay stubs module pending payroll integration',
      meta: { employeeId: user!.userId },
    });
  }),
);

// ─── Get Leave Balances ───
// Returns a placeholder structure since leave management tables are not yet implemented.

portalRouter.get(
  '/leave-balances',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Placeholder: real implementation would query a leave_balances table
    res.json({
      success: true,
      data: {
        vacation: { total: 80, used: 0, remaining: 80, unit: 'hours' },
        sick: { total: 40, used: 0, remaining: 40, unit: 'hours' },
        personal: { total: 16, used: 0, remaining: 16, unit: 'hours' },
      },
      meta: { employeeId: user!.userId },
    });
  }),
);

// ─── Submit Leave Request ───
// Returns a placeholder acknowledgment since leave management tables are not yet implemented.

portalRouter.post(
  '/leave-request',
  validateBody({
    leaveType: { required: true, type: 'string', maxLength: 50 },
    startDate: { required: true, type: 'string' },
    endDate: { required: true, type: 'string' },
    reason: { required: false, type: 'string', maxLength: 1000 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { leaveType, startDate, endDate, reason } = req.body;

    // Placeholder: real implementation would insert into a leave_requests table
    res.status(201).json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        employeeId: user!.userId,
        leaveType,
        startDate,
        endDate,
        reason: reason || null,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
      message: 'Leave request submitted for approval',
    });
  }),
);

// ─── Get Shift Schedule ───

portalRouter.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Default to current week if no date range specified
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const fromDate = String(req.query.from || startOfWeek.toISOString().split('T')[0]);
    const toDate = String(req.query.to || endOfWeek.toISOString().split('T')[0]);

    const rows = await db
      .select()
      .from(shiftSchedules)
      .where(
        and(
          eq(shiftSchedules.userId, user!.userId),
          gte(shiftSchedules.shiftDate, fromDate),
          lte(shiftSchedules.shiftDate, toDate),
        ),
      )
      .orderBy(shiftSchedules.shiftDate);

    res.json({ success: true, data: rows });
  }),
);

// ─── Get Training & Certifications ───

portalRouter.get(
  '/training',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const rows = await db
      .select()
      .from(trainingCertifications)
      .where(eq(trainingCertifications.userId, user!.userId))
      .orderBy(desc(trainingCertifications.expiryDate));

    res.json({ success: true, data: rows });
  }),
);

// ─── Get Announcements ───

portalRouter.get(
  '/announcements',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const now = new Date();

    const rows = await db
      .select()
      .from(companyAnnouncements)
      .where(
        and(
          eq(companyAnnouncements.tenantId, user!.tenantId),
          eq(companyAnnouncements.isActive, true),
        ),
      )
      .orderBy(desc(companyAnnouncements.createdAt));

    // Filter out expired announcements in application code
    const active = rows.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt) > now,
    );

    res.json({ success: true, data: active });
  }),
);
