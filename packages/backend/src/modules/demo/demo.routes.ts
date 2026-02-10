import { Router } from 'express';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../database/connection.js';
import { demoAccessCodes } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { validateBody } from '../../core/validate.js';

const DEMO_SECRET = process.env.DEMO_JWT_SECRET || 'demo-secret-change-in-production';

export const demoRouter = Router();

// ─── POST /api/demo/validate ───

demoRouter.post(
  '/validate',
  validateBody({
    code: { required: true, type: 'string', minLength: 4, maxLength: 20 },
  }),
  asyncHandler(async (req, res) => {
    const { code } = req.body;

    const [demoCode] = await db
      .select()
      .from(demoAccessCodes)
      .where(
        and(
          eq(demoAccessCodes.code, code.toUpperCase()),
          eq(demoAccessCodes.isActive, true),
          gt(demoAccessCodes.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!demoCode) {
      throw new AppError(404, 'Invalid or expired demo code');
    }

    if (demoCode.maxUsages && demoCode.usageCount !== null && demoCode.usageCount >= demoCode.maxUsages) {
      throw new AppError(403, 'Demo code has reached maximum usage limit');
    }

    // Increment usage count
    await db
      .update(demoAccessCodes)
      .set({ usageCount: (demoCode.usageCount || 0) + 1 })
      .where(eq(demoAccessCodes.id, demoCode.id));

    // Generate a signed demo token
    const modulesEnabled = demoCode.modulesEnabled
      ? JSON.parse(demoCode.modulesEnabled)
      : ['dashboard', 'financial', 'sales', 'procurement', 'inventory', 'manufacturing'];

    const demoToken = jwt.sign(
      {
        type: 'demo',
        codeId: demoCode.id,
        template: demoCode.template,
        modules: modulesEnabled,
      },
      DEMO_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      success: true,
      data: {
        token: demoToken,
        template: demoCode.template,
        modules: modulesEnabled,
        expiresIn: 24 * 60 * 60, // seconds
      },
    });
  }),
);
