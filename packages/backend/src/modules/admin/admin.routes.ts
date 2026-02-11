import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, desc, sql, count, sum, and, gte } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import {
  adminUsers, loginAuditLogs, demoAccessCodes,
  tenants, users, salesOrders, purchaseOrders, workOrders,
} from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { validateBody } from '../../core/validate.js';
import type { Request, Response, NextFunction } from 'express';

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export const adminRouter = Router();

// ─── Admin Token Types ───

interface AdminTokenPayload {
  adminId: string;
  email: string;
  type: 'admin';
}

interface AdminAuthRequest extends Request {
  admin?: AdminTokenPayload;
}

function generateAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '8h' });
}

function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload;
  if (decoded.type !== 'admin') throw new Error('Not an admin token');
  return decoded;
}

// ─── Admin Auth Middleware ───

function requireAdmin(req: AdminAuthRequest, _res: Response, next: NextFunction) {
  // Check Authorization header first (works through proxies), then cookie as fallback
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.admin_token;
  if (!token) return next(new AppError(401, 'Admin authentication required'));
  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired admin token'));
  }
}

// ─── Helper: Log login attempt ───

async function logLogin(data: {
  email: string;
  userType: 'user' | 'admin' | 'demo';
  userId?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}) {
  await db.insert(loginAuditLogs).values({
    email: data.email,
    userType: data.userType,
    userId: data.userId ?? null,
    success: data.success,
    ipAddress: data.ipAddress ?? null,
    userAgent: data.userAgent ?? null,
    failureReason: data.failureReason ?? null,
  });
}

function setAdminCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    path: '/',
  });
}

function clearAdminCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    path: '/',
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    secure: isProduction,
  });
}

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/auth/login
adminRouter.post(
  '/auth/login',
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';

    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

    if (!admin) {
      await logLogin({ email, userType: 'admin', success: false, ipAddress: ip, userAgent: ua, failureReason: 'User not found' });
      throw new AppError(401, 'Invalid email or password');
    }
    if (!admin.isActive) {
      await logLogin({ email, userType: 'admin', userId: admin.id, success: false, ipAddress: ip, userAgent: ua, failureReason: 'Account deactivated' });
      throw new AppError(403, 'Account is deactivated');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      await logLogin({ email, userType: 'admin', userId: admin.id, success: false, ipAddress: ip, userAgent: ua, failureReason: 'Invalid password' });
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await db.update(adminUsers).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));

    // Log success
    await logLogin({ email, userType: 'admin', userId: admin.id, success: true, ipAddress: ip, userAgent: ua });

    const payload: AdminTokenPayload = { adminId: admin.id, email: admin.email, type: 'admin' };
    const token = generateAdminToken(payload);
    setAdminCookie(res, token);

    res.json({
      success: true,
      data: {
        admin: { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName },
        token, // Returned so client can use Authorization header (works through proxies)
      },
    });
  }),
);

// POST /api/admin/auth/logout
adminRouter.post('/auth/logout', (_req, res) => {
  clearAdminCookie(res);
  res.json({ success: true });
});

// GET /api/admin/auth/me
adminRouter.get(
  '/auth/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const authReq = req as AdminAuthRequest;
    const [admin] = await db
      .select({ id: adminUsers.id, email: adminUsers.email, firstName: adminUsers.firstName, lastName: adminUsers.lastName })
      .from(adminUsers)
      .where(eq(adminUsers.id, authReq.admin!.adminId))
      .limit(1);
    if (!admin) throw new AppError(404, 'Admin not found');
    res.json({ success: true, data: { admin } });
  }),
);

// POST /api/admin/auth/setup — create first admin (only works when no admins exist)
adminRouter.post(
  '/auth/setup',
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 8 },
    firstName: { required: true, type: 'string' },
    lastName: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    // Only allow if no admin users exist
    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) {
      throw new AppError(403, 'Admin setup already completed');
    }

    const { email, password, firstName, lastName } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const [admin] = await db.insert(adminUsers).values({ email, passwordHash, firstName, lastName }).returning();

    const payload: AdminTokenPayload = { adminId: admin.id, email: admin.email, type: 'admin' };
    const token = generateAdminToken(payload);
    setAdminCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        admin: { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName },
        token,
      },
    });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  DEMO CODES CRUD
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/demo-codes
adminRouter.get(
  '/demo-codes',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const codes = await db
      .select()
      .from(demoAccessCodes)
      .orderBy(desc(demoAccessCodes.createdAt));
    res.json({ success: true, data: codes });
  }),
);

// POST /api/admin/demo-codes
adminRouter.post(
  '/demo-codes',
  requireAdmin,
  validateBody({
    label: { required: true, type: 'string', maxLength: 255 },
    template: { required: false, type: 'string' },
    maxUsages: { required: false, type: 'number' },
    expiryDays: { required: false, type: 'number' },
  }),
  asyncHandler(async (req, res) => {
    const authReq = req as AdminAuthRequest;
    const { label, template = 'manufacturing', maxUsages = 100, expiryDays = 30, modulesEnabled } = req.body;

    // Generate a unique code
    const code = 'DEMO-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiryDays || 30));

    const [created] = await db.insert(demoAccessCodes).values({
      code,
      label,
      template,
      maxUsages,
      expiresAt,
      modulesEnabled: modulesEnabled ? JSON.stringify(modulesEnabled) : null,
      createdBy: authReq.admin!.adminId,
    }).returning();

    res.status(201).json({ success: true, data: created });
  }),
);

// PATCH /api/admin/demo-codes/:id/revoke
adminRouter.patch(
  '/demo-codes/:id/revoke',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [updated] = await db
      .update(demoAccessCodes)
      .set({ isActive: false })
      .where(eq(demoAccessCodes.id, id))
      .returning();
    if (!updated) throw new AppError(404, 'Demo code not found');
    res.json({ success: true, data: updated });
  }),
);

// DELETE /api/admin/demo-codes/:id
adminRouter.delete(
  '/demo-codes/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.delete(demoAccessCodes).where(eq(demoAccessCodes.id, id));
    res.json({ success: true });
  }),
);

// GET /api/admin/demo-codes/stats
adminRouter.get(
  '/demo-codes/stats',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const allCodes = await db.select().from(demoAccessCodes);
    const active = allCodes.filter(c => c.isActive && new Date(c.expiresAt) > new Date());
    const totalUses = allCodes.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    res.json({
      success: true,
      data: {
        totalCodes: allCodes.length,
        activeCodes: active.length,
        totalUses,
        expiredCodes: allCodes.filter(c => new Date(c.expiresAt) <= new Date()).length,
      },
    });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  DEMO CODE VALIDATION (PUBLIC — used by sign-in page)
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/demo-codes/validate
adminRouter.post(
  '/demo-codes/validate',
  validateBody({
    code: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { code, email } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';

    const [demoCode] = await db
      .select()
      .from(demoAccessCodes)
      .where(eq(demoAccessCodes.code, code.toUpperCase()))
      .limit(1);

    if (!demoCode) {
      await logLogin({ email, userType: 'demo', success: false, ipAddress: ip, userAgent: ua, failureReason: 'Invalid code' });
      throw new AppError(404, 'Invalid demo code');
    }
    if (!demoCode.isActive) {
      await logLogin({ email, userType: 'demo', success: false, ipAddress: ip, userAgent: ua, failureReason: 'Code revoked' });
      throw new AppError(410, 'This demo code has been revoked');
    }
    if (new Date(demoCode.expiresAt) <= new Date()) {
      await logLogin({ email, userType: 'demo', success: false, ipAddress: ip, userAgent: ua, failureReason: 'Code expired' });
      throw new AppError(410, 'This demo code has expired');
    }
    if (demoCode.maxUsages && demoCode.usageCount !== null && demoCode.usageCount >= demoCode.maxUsages) {
      await logLogin({ email, userType: 'demo', success: false, ipAddress: ip, userAgent: ua, failureReason: 'Max uses reached' });
      throw new AppError(429, 'This demo code has reached its maximum number of uses');
    }

    // Increment usage
    await db
      .update(demoAccessCodes)
      .set({ usageCount: (demoCode.usageCount || 0) + 1 })
      .where(eq(demoAccessCodes.id, demoCode.id));

    // Log success
    await logLogin({ email, userType: 'demo', success: true, ipAddress: ip, userAgent: ua });

    res.json({
      success: true,
      data: {
        template: demoCode.template,
        modulesEnabled: demoCode.modulesEnabled ? JSON.parse(demoCode.modulesEnabled) : null,
        expiresAt: demoCode.expiresAt,
      },
    });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  LOGIN AUDIT LOGS
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/audit-logs
adminRouter.get(
  '/audit-logs',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const userType = req.query.userType as string | undefined;

    let query = db.select().from(loginAuditLogs).orderBy(desc(loginAuditLogs.createdAt)).limit(limit).offset(offset);

    if (userType) {
      query = db.select().from(loginAuditLogs).where(eq(loginAuditLogs.userType, userType)).orderBy(desc(loginAuditLogs.createdAt)).limit(limit).offset(offset);
    }

    const logs = await query;
    const [{ total }] = await db.select({ total: count() }).from(loginAuditLogs);

    res.json({ success: true, data: { logs, total } });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  PLATFORM STATS (for admin dashboard)
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/stats
adminRouter.get(
  '/stats',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [tenantCount] = await db.select({ total: count() }).from(tenants);
    const [userCount] = await db.select({ total: count() }).from(users);
    const [activeUserCount] = await db.select({ total: count() }).from(users).where(eq(users.isActive, true));
    const [demoCodeCount] = await db.select({ total: count() }).from(demoAccessCodes).where(eq(demoAccessCodes.isActive, true));

    // Recent login count (24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentLogins] = await db.select({ total: count() }).from(loginAuditLogs).where(
      and(eq(loginAuditLogs.success, true), gte(loginAuditLogs.createdAt, oneDayAgo))
    );

    res.json({
      success: true,
      data: {
        totalTenants: tenantCount.total,
        totalUsers: userCount.total,
        activeUsers: activeUserCount.total,
        activeDemoCodes: demoCodeCount.total,
        loginsLast24h: recentLogins.total,
      },
    });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  TENANT MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/tenants
adminRouter.get(
  '/tenants',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
    res.json({ success: true, data: allTenants });
  }),
);

// ═══════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/users
adminRouter.get(
  '/users',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        tenantId: users.tenantId,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    res.json({ success: true, data: allUsers });
  }),
);

// PATCH /api/admin/users/:id/deactivate
adminRouter.patch(
  '/users/:id/deactivate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [updated] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new AppError(404, 'User not found');
    res.json({ success: true, data: updated });
  }),
);

// PATCH /api/admin/users/:id/activate
adminRouter.patch(
  '/users/:id/activate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [updated] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new AppError(404, 'User not found');
    res.json({ success: true, data: updated });
  }),
);
