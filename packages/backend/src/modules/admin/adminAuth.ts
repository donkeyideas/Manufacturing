import jwt from 'jsonwebtoken';
import { AppError } from '../../core/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  type: 'admin';
}

export interface AdminAuthRequest extends Request {
  admin?: AdminTokenPayload;
}

export function generateAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload;
  if (decoded.type !== 'admin') throw new Error('Not an admin token');
  return decoded;
}

export function requireAdmin(req: AdminAuthRequest, _res: Response, next: NextFunction) {
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
