import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { users, refreshTokens, tenants, loginAuditLogs } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { validateBody } from '../../core/validate.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  requireAuth,
  type TokenPayload,
  type AuthenticatedRequest,
} from '../../core/auth.js';

export const authRouter = Router();

// ─── POST /api/auth/register ───

authRouter.post(
  '/register',
  validateBody({
    email: { required: true, type: 'string', maxLength: 255 },
    password: { required: true, type: 'string', minLength: 8 },
    firstName: { required: true, type: 'string', maxLength: 100 },
    lastName: { required: true, type: 'string', maxLength: 100 },
    companyName: { required: true, type: 'string', maxLength: 255 },
  }),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, companyName } = req.body;

    // Check if email already exists
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new AppError(409, 'Email already registered');
    }

    // Create tenant
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const [tenant] = await db.insert(tenants).values({ name: companyName, slug }).returning();

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({
      tenantId: tenant.id,
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'owner',
    }).returning();

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token hash
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      },
    });
  }),
);

// ─── POST /api/auth/login ───

authRouter.post(
  '/login',
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      await db.insert(loginAuditLogs).values({ email, userType: 'user', success: false, ipAddress: ip, userAgent: ua, failureReason: 'User not found' });
      throw new AppError(401, 'Invalid email or password');
    }
    if (!user.isActive) {
      await db.insert(loginAuditLogs).values({ email, userType: 'user', userId: user.id, success: false, ipAddress: ip, userAgent: ua, failureReason: 'Account deactivated' });
      throw new AppError(403, 'Account is deactivated');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await db.insert(loginAuditLogs).values({ email, userType: 'user', userId: user.id, success: false, ipAddress: ip, userAgent: ua, failureReason: 'Invalid password' });
      throw new AppError(401, 'Invalid email or password');
    }

    // Log successful login
    await db.insert(loginAuditLogs).values({ email, userType: 'user', userId: user.id, success: true, ipAddress: ip, userAgent: ua });

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    const payload: TokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
    });
  }),
);

// ─── POST /api/auth/refresh ───

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new AppError(401, 'No refresh token');
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearAuthCookies(res);
      throw new AppError(401, 'Invalid refresh token');
    }

    // Verify user still exists and is active
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user || !user.isActive) {
      clearAuthCookies(res);
      throw new AppError(401, 'User not found or deactivated');
    }

    // Rotate tokens
    const payload: TokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Delete old refresh tokens for this user and store new one
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
    const tokenHash = await bcrypt.hash(newRefreshToken, 10);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({ success: true });
  }),
);

// ─── POST /api/auth/logout ───

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await db.delete(refreshTokens).where(eq(refreshTokens.userId, decoded.userId));
      } catch {
        // Token invalid, just clear cookies
      }
    }

    clearAuthCookies(res);
    res.json({ success: true });
  }),
);

// ─── GET /api/auth/me ───

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        tenantId: users.tenantId,
      })
      .from(users)
      .where(eq(users.id, authReq.user!.userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ success: true, data: { user } });
  }),
);
