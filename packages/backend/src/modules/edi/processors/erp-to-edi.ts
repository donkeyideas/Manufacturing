import { eq } from 'drizzle-orm';
import { db } from '../../../database/connection.js';
import {
  salesOrders, salesOrderLines, customers,
  purchaseOrders, purchaseOrderLines, vendors, items,
} from '../../../database/schema.js';

interface GeneratedDocument {
  rows: Record<string, unknown>[];
  metadata: {
    documentType: string;
    recordNumber: string;
    recordId: string;
  };
}

/**
 * Generate outbound 850 (Purchase Order) from an ERP Purchase Order.
 */
export async function generate850(poId: string): Promise<GeneratedDocument> {
  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, poId));

  if (!po) throw new Error(`Purchase Order ${poId} not found`);

  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, po.vendorId));

  const lines = await db
    .select()
    .from(purchaseOrderLines)
    .where(eq(purchaseOrderLines.poId, poId));

  const rows: Record<string, unknown>[] = [];

  for (const line of lines) {
    let itemNumber = '';
    if (line.itemId) {
      const [item] = await db.select().from(items).where(eq(items.id, line.itemId));
      if (item) itemNumber = item.itemNumber;
    }

    rows.push({
      PONumber: po.poNumber,
      PODate: po.poDate,
      VendorNumber: vendor?.vendorNumber || '',
      VendorName: vendor?.vendorName || '',
      ItemNumber: itemNumber,
      ItemDescription: line.itemDescription,
      QuantityOrdered: line.quantityOrdered,
      UnitPrice: line.unitPrice,
      LineTotal: line.lineTotal,
      DeliveryDate: po.deliveryDate || '',
      Currency: po.currency,
    });
  }

  return {
    rows,
    metadata: { documentType: '850', recordNumber: po.poNumber, recordId: po.id },
  };
}

/**
 * Generate outbound 810 (Invoice) from a Sales Order.
 */
export async function generate810(soId: string): Promise<GeneratedDocument> {
  const [so] = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.id, soId));

  if (!so) throw new Error(`Sales Order ${soId} not found`);

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, so.customerId));

  const lines = await db
    .select()
    .from(salesOrderLines)
    .where(eq(salesOrderLines.salesOrderId, soId));

  const rows: Record<string, unknown>[] = [];

  for (const line of lines) {
    let itemNumber = '';
    if (line.itemId) {
      const [item] = await db.select().from(items).where(eq(items.id, line.itemId));
      if (item) itemNumber = item.itemNumber;
    }

    rows.push({
      InvoiceNumber: so.orderNumber,
      InvoiceDate: new Date().toISOString().split('T')[0],
      CustomerNumber: customer?.customerNumber || '',
      CustomerName: customer?.customerName || '',
      ItemNumber: itemNumber,
      ItemDescription: line.itemDescription,
      Quantity: line.quantityOrdered,
      UnitPrice: line.unitPrice,
      LineTotal: line.lineTotal,
      Subtotal: so.subtotal,
      TaxAmount: so.taxAmount,
      TotalAmount: so.totalAmount,
      Currency: so.currency,
    });
  }

  return {
    rows,
    metadata: { documentType: '810', recordNumber: so.orderNumber, recordId: so.id },
  };
}

/**
 * Generate outbound 856 (Advanced Shipping Notice) from a Sales Order.
 */
export async function generate856(soId: string): Promise<GeneratedDocument> {
  const [so] = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.id, soId));

  if (!so) throw new Error(`Sales Order ${soId} not found`);

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, so.customerId));

  const lines = await db
    .select()
    .from(salesOrderLines)
    .where(eq(salesOrderLines.salesOrderId, soId));

  const rows: Record<string, unknown>[] = [];

  for (const line of lines) {
    let itemNumber = '';
    if (line.itemId) {
      const [item] = await db.select().from(items).where(eq(items.id, line.itemId));
      if (item) itemNumber = item.itemNumber;
    }

    rows.push({
      ShipmentNumber: `SHP-${so.orderNumber}`,
      ShipDate: new Date().toISOString().split('T')[0],
      OrderNumber: so.orderNumber,
      CustomerNumber: customer?.customerNumber || '',
      CustomerName: customer?.customerName || '',
      ItemNumber: itemNumber,
      ItemDescription: line.itemDescription,
      QuantityShipped: line.quantityOrdered,
      UnitOfMeasure: 'EA',
    });
  }

  return {
    rows,
    metadata: { documentType: '856', recordNumber: so.orderNumber, recordId: so.id },
  };
}

/**
 * Generate outbound 997 (Functional Acknowledgment).
 */
export function generate997(
  originalTransactionNumber: string,
  originalDocType: string,
  accepted: boolean
): Record<string, unknown>[] {
  return [{
    AcknowledgmentCode: accepted ? 'A' : 'R', // A=Accepted, R=Rejected
    OriginalTransactionNumber: originalTransactionNumber,
    OriginalDocumentType: originalDocType,
    AcknowledgmentDate: new Date().toISOString().split('T')[0],
    Status: accepted ? 'Accepted' : 'Rejected',
  }];
}
