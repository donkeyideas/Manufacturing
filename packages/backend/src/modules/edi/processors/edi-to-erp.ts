import { eq, sql } from 'drizzle-orm';
import { db } from '../../../database/connection.js';
import {
  salesOrders, salesOrderLines, customers, items,
  purchaseOrders, purchaseOrderLines, vendors,
} from '../../../database/schema.js';

interface ProcessResult {
  success: boolean;
  recordId?: string;
  recordNumber?: string;
  errors?: string[];
}

/**
 * Process inbound 850 (Purchase Order) → create Sales Order.
 * When a customer sends us their PO, it becomes our Sales Order.
 */
export async function process850(
  parsedRows: Record<string, unknown>[],
  tenantId: string,
  userId: string
): Promise<ProcessResult> {
  const errors: string[] = [];

  if (parsedRows.length === 0) {
    return { success: false, errors: ['No data rows found in document'] };
  }

  // Extract header info from first row
  const firstRow = parsedRows[0];
  const customerNumber = String(firstRow.customerNumber || firstRow.CustomerNumber || firstRow.customer_number || '');
  const poNumber = String(firstRow.poNumber || firstRow.PONumber || firstRow.po_number || '');

  // Look up customer
  let customerId: string | null = null;
  if (customerNumber) {
    const [cust] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.customerNumber, customerNumber))
      .limit(1);
    if (cust) customerId = cust.id;
    else errors.push(`Customer "${customerNumber}" not found`);
  }

  if (!customerId) {
    return { success: false, errors: errors.length > 0 ? errors : ['Customer not specified'] };
  }

  // Generate SO number
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(salesOrders)
    .where(eq(salesOrders.tenantId, tenantId));
  const soNum = `SO-${String((countResult?.count || 0) + 1).padStart(5, '0')}`;

  // Calculate totals from line items
  let subtotal = 0;
  const lineItems: { itemDesc: string; qty: number; price: number; itemId: string | null }[] = [];

  for (let i = 0; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const itemNumber = String(row.itemNumber || row.ItemNumber || row.item_number || '');
    const qty = Number(row.quantityOrdered || row.QuantityOrdered || row.quantity || 0);
    const price = Number(row.unitPrice || row.UnitPrice || row.unit_price || 0);
    const description = String(row.itemDescription || row.ItemDescription || row.description || itemNumber);

    let itemId: string | null = null;
    if (itemNumber) {
      const [item] = await db
        .select({ id: items.id })
        .from(items)
        .where(eq(items.itemNumber, itemNumber))
        .limit(1);
      if (item) itemId = item.id;
    }

    subtotal += qty * price;
    lineItems.push({ itemDesc: description, qty, price, itemId });
  }

  const taxAmount = subtotal * 0.08; // Default 8% tax
  const totalAmount = subtotal + taxAmount;

  // Create Sales Order
  const [so] = await db.insert(salesOrders).values({
    tenantId,
    orderNumber: soNum,
    orderDate: new Date().toISOString().split('T')[0],
    customerId,
    status: 'confirmed',
    subtotal: String(subtotal),
    taxAmount: String(taxAmount),
    totalAmount: String(totalAmount),
    notes: poNumber ? `EDI 850 — Customer PO: ${poNumber}` : 'Created from EDI 850',
    createdBy: userId,
  }).returning();

  // Create line items
  for (let i = 0; i < lineItems.length; i++) {
    const line = lineItems[i];
    await db.insert(salesOrderLines).values({
      salesOrderId: so.id,
      itemId: line.itemId,
      lineNumber: i + 1,
      itemDescription: line.itemDesc,
      quantityOrdered: String(line.qty),
      unitPrice: String(line.price),
      lineTotal: String(line.qty * line.price),
    });
  }

  return { success: true, recordId: so.id, recordNumber: soNum };
}

/**
 * Process inbound 810 (Invoice) → mark PO as invoiced / create record.
 */
export async function process810(
  parsedRows: Record<string, unknown>[],
  tenantId: string,
  _userId: string
): Promise<ProcessResult> {
  if (parsedRows.length === 0) {
    return { success: false, errors: ['No data rows found'] };
  }

  const firstRow = parsedRows[0];
  const poNumber = String(firstRow.poNumber || firstRow.PONumber || firstRow.po_number || '');

  if (poNumber) {
    // Update PO status if found
    const [po] = await db
      .select({ id: purchaseOrders.id })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.poNumber, poNumber))
      .limit(1);

    if (po) {
      await db.update(purchaseOrders)
        .set({ status: 'received', updatedAt: new Date() })
        .where(eq(purchaseOrders.id, po.id));

      return { success: true, recordId: po.id, recordNumber: poNumber };
    }
  }

  return { success: true, recordNumber: `Invoice processed (PO: ${poNumber || 'N/A'})` };
}

/**
 * Process inbound 856 (ASN) → update PO quantities received.
 */
export async function process856(
  parsedRows: Record<string, unknown>[],
  tenantId: string,
  _userId: string
): Promise<ProcessResult> {
  if (parsedRows.length === 0) {
    return { success: false, errors: ['No data rows found'] };
  }

  const firstRow = parsedRows[0];
  const poNumber = String(firstRow.poNumber || firstRow.PONumber || firstRow.po_number || '');

  if (poNumber) {
    const [po] = await db
      .select({ id: purchaseOrders.id })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.poNumber, poNumber))
      .limit(1);

    if (po) {
      // Update PO to partially_received
      await db.update(purchaseOrders)
        .set({ status: 'partially_received', updatedAt: new Date() })
        .where(eq(purchaseOrders.id, po.id));

      // Update line quantities if item numbers are provided
      for (const row of parsedRows) {
        const itemNumber = String(row.itemNumber || row.ItemNumber || '');
        const qtyShipped = Number(row.quantityShipped || row.QuantityShipped || row.quantity || 0);

        if (itemNumber && qtyShipped > 0) {
          const [item] = await db
            .select({ id: items.id })
            .from(items)
            .where(eq(items.itemNumber, itemNumber))
            .limit(1);

          if (item) {
            await db.update(purchaseOrderLines)
              .set({ quantityReceived: String(qtyShipped) })
              .where(eq(purchaseOrderLines.poId, po.id));
          }
        }
      }

      return { success: true, recordId: po.id, recordNumber: poNumber };
    }
  }

  return { success: true, recordNumber: `ASN processed (PO: ${poNumber || 'N/A'})` };
}
