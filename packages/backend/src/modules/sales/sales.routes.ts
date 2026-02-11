import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { customers, salesOrders, salesOrderLines, items } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { customerImportSchema, salesOrderImportSchema } from '@erp/shared';

export const salesRouter = Router();
salesRouter.use(requireAuth);

// ─── Customers ───

salesRouter.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, user!.tenantId))
      .orderBy(customers.customerNumber);

    res.json({ success: true, data: rows });
  }),
);

salesRouter.get(
  '/customers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, String(req.params.id)), eq(customers.tenantId, user!.tenantId)))
      .limit(1);

    if (!customer) throw new AppError(404, 'Customer not found');
    res.json({ success: true, data: customer });
  }),
);

salesRouter.post(
  '/customers',
  validateBody({
    customerNumber: { required: true, type: 'string', maxLength: 30 },
    customerName: { required: true, type: 'string', maxLength: 255 },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { customerNumber, customerName, contactName, contactEmail, contactPhone, paymentTerms, creditLimit } = req.body;

    const [customer] = await db.insert(customers).values({
      tenantId: user!.tenantId,
      customerNumber,
      customerName,
      contactName,
      contactEmail,
      contactPhone,
      paymentTerms,
      creditLimit: creditLimit ? String(creditLimit) : undefined,
    }).returning();

    res.status(201).json({ success: true, data: customer });
  }),
);

salesRouter.put(
  '/customers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { customerName, contactName, contactEmail, contactPhone, paymentTerms, creditLimit, isActive } = req.body;

    const [updated] = await db
      .update(customers)
      .set({
        customerName, contactName, contactEmail, contactPhone, paymentTerms, isActive,
        creditLimit: creditLimit !== undefined ? String(creditLimit) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Customer not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Customers: Delete ───

salesRouter.delete(
  '/customers/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Customer not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Sales Orders ───

salesRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select({
        id: salesOrders.id,
        orderNumber: salesOrders.orderNumber,
        orderDate: salesOrders.orderDate,
        customerId: salesOrders.customerId,
        customerName: customers.customerName,
        status: salesOrders.status,
        subtotal: salesOrders.subtotal,
        taxAmount: salesOrders.taxAmount,
        totalAmount: salesOrders.totalAmount,
        currency: salesOrders.currency,
        deliveryDate: salesOrders.deliveryDate,
        notes: salesOrders.notes,
        createdAt: salesOrders.createdAt,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(eq(salesOrders.tenantId, user!.tenantId))
      .orderBy(desc(salesOrders.orderDate));

    res.json({ success: true, data: rows });
  }),
);

salesRouter.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [order] = await db
      .select()
      .from(salesOrders)
      .where(and(eq(salesOrders.id, id), eq(salesOrders.tenantId, user!.tenantId)))
      .limit(1);

    if (!order) throw new AppError(404, 'Sales order not found');

    const lines = await db
      .select()
      .from(salesOrderLines)
      .where(eq(salesOrderLines.salesOrderId, id))
      .orderBy(salesOrderLines.lineNumber);

    res.json({ success: true, data: { ...order, lines } });
  }),
);

salesRouter.post(
  '/orders',
  validateBody({
    orderDate: { required: true, type: 'string' },
    customerId: { required: true, type: 'string' },
    lines: { required: true, type: 'array' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { orderDate, customerId, deliveryDate, notes, lines: lineItems } = req.body;

    // Generate order number
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(eq(salesOrders.tenantId, user!.tenantId));
    const orderNumber = `SO-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    for (const line of lineItems) {
      subtotal += Number(line.quantityOrdered) * Number(line.unitPrice);
    }
    const taxAmount = subtotal * 0.08; // Default 8% tax
    const totalAmount = subtotal + taxAmount;

    const [order] = await db.insert(salesOrders).values({
      tenantId: user!.tenantId,
      orderNumber,
      orderDate,
      customerId,
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
      await db.insert(salesOrderLines).values({
        salesOrderId: order.id,
        itemId: line.itemId,
        lineNumber: i + 1,
        itemDescription: line.itemDescription,
        quantityOrdered: String(line.quantityOrdered),
        unitPrice: String(line.unitPrice),
        lineTotal: String(lineTotal),
      });
    }

    res.status(201).json({ success: true, data: order });
  }),
);

// ─── Sales Orders: Delete ───

salesRouter.delete(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    await db.delete(salesOrderLines).where(eq(salesOrderLines.salesOrderId, id));
    const [deleted] = await db
      .delete(salesOrders)
      .where(and(eq(salesOrders.id, id), eq(salesOrders.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Sales order not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Sales Overview / KPIs ───

salesRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const customerCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(and(eq(customers.tenantId, user!.tenantId), eq(customers.isActive, true)));

    const orderStats = await db
      .select({
        count: sql<number>`count(*)`,
        totalValue: sql<number>`coalesce(sum(cast(${salesOrders.totalAmount} as numeric)), 0)`,
      })
      .from(salesOrders)
      .where(eq(salesOrders.tenantId, user!.tenantId));

    const openOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.tenantId, user!.tenantId),
          sql`${salesOrders.status} NOT IN ('closed', 'cancelled', 'delivered')`,
        ),
      );

    res.json({
      success: true,
      data: {
        totalCustomers: Number(customerCount[0].count),
        totalOrders: Number(orderStats[0].count),
        totalRevenue: Number(orderStats[0].totalValue),
        openOrders: Number(openOrders[0].count),
      },
    });
  }),
);

// ─── Bulk Import ───

salesRouter.post('/customers/import', requireAuth, createImportHandler(customerImportSchema, async (rows, tenantId) => {
  await db.insert(customers).values(
    rows.map(row => ({
      tenantId,
      customerNumber: String(row.customerNumber),
      customerName: String(row.customerName),
      contactName: row.contactName ? String(row.contactName) : null,
      contactEmail: row.contactEmail ? String(row.contactEmail) : null,
      contactPhone: row.contactPhone ? String(row.contactPhone) : null,
      paymentTerms: row.paymentTerms ? String(row.paymentTerms) : null,
      creditLimit: row.creditLimit ? String(row.creditLimit) : null,
      isActive: row.isActive !== false,
    }))
  );
}));

salesRouter.post('/orders/import', requireAuth, createImportHandler(salesOrderImportSchema, async (rows, tenantId) => {
  // Group rows by sales order number
  const orderMap = new Map<string, typeof rows>();
  for (const row of rows) {
    const soNumber = String(row.soNumber);
    if (!orderMap.has(soNumber)) {
      orderMap.set(soNumber, []);
    }
    orderMap.get(soNumber)!.push(row);
  }

  // Process each sales order
  for (const [soNumber, orderRows] of orderMap) {
    const firstRow = orderRows[0];

    // Find customer by customer number
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.customerNumber, String(firstRow.customerNumber)), eq(customers.tenantId, tenantId)))
      .limit(1);

    if (!customer) continue; // Skip if customer not found

    // Calculate totals
    let subtotal = 0;
    for (const row of orderRows) {
      subtotal += Number(row.quantityOrdered) * Number(row.unitPrice);
    }
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;

    // Insert sales order
    const status = String(firstRow.status || 'draft') as 'draft' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'invoiced' | 'closed' | 'cancelled';
    const [order] = await db.insert(salesOrders).values({
      tenantId,
      orderNumber: soNumber,
      orderDate: String(firstRow.soDate),
      customerId: customer.id,
      status,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      totalAmount: String(totalAmount),
      currency: String(firstRow.currency || 'USD'),
      deliveryDate: firstRow.requestedShipDate ? String(firstRow.requestedShipDate) : null,
    }).returning();

    // Insert line items
    for (let i = 0; i < orderRows.length; i++) {
      const row = orderRows[i];
      const itemNumber = String(row.itemNumber);

      // Find item by item number
      const [item] = await db
        .select()
        .from(items)
        .where(and(eq(items.itemNumber, itemNumber), eq(items.tenantId, tenantId)))
        .limit(1);

      const lineTotal = Number(row.quantityOrdered) * Number(row.unitPrice);
      await db.insert(salesOrderLines).values({
        salesOrderId: order.id,
        itemId: item?.id || null,
        lineNumber: i + 1,
        itemDescription: item ? item.itemName : itemNumber,
        quantityOrdered: String(row.quantityOrdered),
        unitPrice: String(row.unitPrice),
        lineTotal: String(lineTotal),
      });
    }
  }
}));
