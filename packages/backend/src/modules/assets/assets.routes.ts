import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { fixedAssets } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { fixedAssetImportSchema } from '@erp/shared';

export const assetsRouter = Router();
assetsRouter.use(requireAuth);

// ─── Fixed Assets: List ───

assetsRouter.get(
  '/fixed-assets',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(fixedAssets)
      .where(eq(fixedAssets.tenantId, user!.tenantId))
      .orderBy(fixedAssets.assetNumber);

    res.json({ success: true, data: rows });
  }),
);

// ─── Fixed Assets: Get by ID ───

assetsRouter.get(
  '/fixed-assets/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [asset] = await db
      .select()
      .from(fixedAssets)
      .where(and(eq(fixedAssets.id, String(req.params.id)), eq(fixedAssets.tenantId, user!.tenantId)))
      .limit(1);

    if (!asset) throw new AppError(404, 'Fixed asset not found');
    res.json({ success: true, data: asset });
  }),
);

// ─── Fixed Assets: Create ───

assetsRouter.post(
  '/fixed-assets',
  validateBody({
    assetNumber: { required: true, type: 'string', maxLength: 50 },
    assetName: { required: true, type: 'string', maxLength: 200 },
    acquisitionDate: { required: true, type: 'string' },
    originalCost: { required: true, type: 'number' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const {
      assetNumber, assetName, assetCategory, acquisitionDate, originalCost,
      currentValue, depreciationMethod, usefulLifeYears, salvageValue,
      location, department, serialNumber,
    } = req.body;

    const [asset] = await db.insert(fixedAssets).values({
      tenantId: user!.tenantId,
      assetNumber,
      assetName,
      assetCategory: assetCategory || null,
      acquisitionDate,
      originalCost: String(originalCost),
      currentValue: currentValue ? String(currentValue) : String(originalCost),
      depreciationMethod: depreciationMethod || 'straight_line',
      usefulLifeYears: usefulLifeYears || null,
      salvageValue: salvageValue ? String(salvageValue) : null,
      location: location || null,
      department: department || null,
      serialNumber: serialNumber || null,
    }).returning();

    res.status(201).json({ success: true, data: asset });
  }),
);

// ─── Fixed Assets: Update ───

assetsRouter.put(
  '/fixed-assets/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const {
      assetName, assetCategory, originalCost, currentValue,
      depreciationMethod, usefulLifeYears, salvageValue,
      location, department, serialNumber, isActive,
    } = req.body;

    const [updated] = await db
      .update(fixedAssets)
      .set({
        assetName, assetCategory, depreciationMethod,
        usefulLifeYears, location, department, serialNumber, isActive,
        originalCost: originalCost !== undefined ? String(originalCost) : undefined,
        currentValue: currentValue !== undefined ? String(currentValue) : undefined,
        salvageValue: salvageValue !== undefined ? String(salvageValue) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Fixed asset not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Fixed Assets: Delete ───

assetsRouter.delete(
  '/fixed-assets/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(fixedAssets)
      .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Fixed asset not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Fixed Assets: Overview ───

assetsRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const totalAssets = await db
      .select({ count: sql<number>`count(*)` })
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, user!.tenantId), eq(fixedAssets.isActive, true)));

    const totalValue = await db
      .select({ total: sql<number>`coalesce(sum(cast(${fixedAssets.currentValue} as numeric)), 0)` })
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, user!.tenantId), eq(fixedAssets.isActive, true)));

    res.json({
      success: true,
      data: {
        totalAssets: Number(totalAssets[0].count),
        totalValue: Number(totalValue[0].total),
      },
    });
  }),
);

// ─── Fixed Assets: Bulk Import ───

assetsRouter.post('/fixed-assets/import', requireAuth, createImportHandler(fixedAssetImportSchema, async (rows, tenantId) => {
  await db.insert(fixedAssets).values(
    rows.map(row => ({
      tenantId,
      assetNumber: String(row.assetNumber),
      assetName: String(row.assetName),
      assetCategory: row.assetCategory ? String(row.assetCategory) : null,
      acquisitionDate: String(row.acquisitionDate),
      originalCost: String(row.originalCost || 0),
      currentValue: row.currentValue ? String(row.currentValue) : String(row.originalCost || 0),
      depreciationMethod: row.depreciationMethod ? String(row.depreciationMethod) : 'straight_line',
      usefulLifeYears: row.usefulLifeYears ? Number(row.usefulLifeYears) : null,
      salvageValue: row.salvageValue ? String(row.salvageValue) : null,
      location: row.location ? String(row.location) : null,
      department: row.department ? String(row.department) : null,
      serialNumber: row.serialNumber ? String(row.serialNumber) : null,
      isActive: row.isActive !== false,
    }))
  );
}));
