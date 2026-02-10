import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { vendors, purchaseOrders, purchaseOrderLines, items } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';

export const procurementRouter = Router();
procurementRouter.use(requireAuth);

// ─── Vendors ───

procurementRouter.get(
  '/vendors',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(vendors)
      .where(eq(vendors.tenantId, user!.tenantId))
      .orderBy(vendors.vendorNumber);

    res.json({ success: true, data: rows });
  }),
);

procurementRouter.get(
  '/vendors/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, String(req.params.id)), eq(vendors.tenantId, user!.tenantId)))
      .limit(1);

    if (!vendor) throw new AppError(404, 'Vendor not found');
    res.json({ success: true, data: vendor });
  }),
);

procurementRouter.post(
  '/vendors',
  validateBody({
    vendorNumber: { required: true, type: 'string', maxLength: 30 },
    vendorName: { required: true, type: 'string', maxLength: 255 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { vendorNumber, vendorName, contactName, contactEmail, contactPhone, paymentTerms, creditLimit, is1099Eligible } = req.body;

    const [vendor] = await db.insert(vendors).values({
      tenantId: user!.tenantId,
      vendorNumber,
      vendorName,
      contactName,
      contactEmail,
      contactPhone,
      paymentTerms,
      creditLimit: creditLimit ? String(creditLimit) : undefined,
      is1099Eligible: is1099Eligible || false,
    }).returning();

    res.status(201).json({ success: true, data: vendor });
  }),
);

procurementRouter.put(
  '/vendors/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { vendorName, contactName, contactEmail, contactPhone, paymentTerms, creditLimit, isActive, is1099Eligible } = req.body;

    const [updated] = await db
      .update(vendors)
      .set({
        vendorName, contactName, contactEmail, contactPhone, paymentTerms, isActive, is1099Eligible,
        creditLimit: creditLimit !== undefined ? String(creditLimit) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(vendors.id, id), eq(vendors.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Vendor not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Purchase Orders ───

procurementRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.tenantId, user!.tenantId))
      .orderBy(desc(purchaseOrders.poDate));

    res.json({ success: true, data: rows });
  }),
);

procurementRouter.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [po] = await db
      .select()
      .from(purchaseOrders)
      .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, user!.tenantId)))
      .limit(1);

    if (!po) throw new AppError(404, 'Purchase order not found');

    const lines = await db
      .select({
        id: purchaseOrderLines.id,
        lineNumber: purchaseOrderLines.lineNumber,
        itemDescription: purchaseOrderLines.itemDescription,
        quantityOrdered: purchaseOrderLines.quantityOrdered,
        quantityReceived: purchaseOrderLines.quantityReceived,
        unitPrice: purchaseOrderLines.unitPrice,
        lineTotal: purchaseOrderLines.lineTotal,
        itemNumber: items.itemNumber,
        itemName: items.itemName,
      })
      .from(purchaseOrderLines)
      .leftJoin(items, eq(purchaseOrderLines.itemId, items.id))
      .where(eq(purchaseOrderLines.poId, id))
      .orderBy(purchaseOrderLines.lineNumber);

    res.json({ success: true, data: { ...po, lines } });
  }),
);

procurementRouter.post(
  '/orders',
  validateBody({
    poDate: { required: true, type: 'string' },
    vendorId: { required: true, type: 'string' },
    lines: { required: true, type: 'array' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { poDate, vendorId, deliveryDate, notes, lines: lineItems } = req.body;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.tenantId, user!.tenantId));
    const poNumber = `PO-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    let subtotal = 0;
    for (const line of lineItems) {
      subtotal += Number(line.quantityOrdered) * Number(line.unitPrice);
    }
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;

    const [po] = await db.insert(purchaseOrders).values({
      tenantId: user!.tenantId,
      poNumber,
      poDate,
      vendorId,
      deliveryDate,
      notes,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      totalAmount: String(totalAmount),
      createdBy: user!.userId,
    }).returning();

    for (let i = 0; i < lineItems.length; i++) {
      const line = lineItems[i];
      const lineTotal = Number(line.quantityOrdered) * Number(line.unitPrice);
      await db.insert(purchaseOrderLines).values({
        poId: po.id,
        itemId: line.itemId,
        lineNumber: i + 1,
        itemDescription: line.itemDescription,
        quantityOrdered: String(line.quantityOrdered),
        unitPrice: String(line.unitPrice),
        lineTotal: String(lineTotal),
      });
    }

    res.status(201).json({ success: true, data: po });
  }),
);

// ─── Procurement Overview / KPIs ───

procurementRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const vendorCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(vendors)
      .where(and(eq(vendors.tenantId, user!.tenantId), eq(vendors.isActive, true)));

    const poStats = await db
      .select({
        count: sql<number>`count(*)`,
        totalValue: sql<number>`coalesce(sum(cast(${purchaseOrders.totalAmount} as numeric)), 0)`,
      })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.tenantId, user!.tenantId));

    const openPOs = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseOrders)
      .where(
        and(
          eq(purchaseOrders.tenantId, user!.tenantId),
          sql`${purchaseOrders.status} NOT IN ('closed', 'cancelled', 'received')`,
        ),
      );

    res.json({
      success: true,
      data: {
        activeVendors: Number(vendorCount[0].count),
        totalPurchaseOrders: Number(poStats[0].count),
        totalSpend: Number(poStats[0].totalValue),
        openPOs: Number(openPOs[0].count),
      },
    });
  }),
);
