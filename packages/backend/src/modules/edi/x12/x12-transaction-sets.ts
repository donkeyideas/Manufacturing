/**
 * Build X12 business segments for specific transaction set types.
 * These functions return arrays of pre-formatted segment strings (without delimiters).
 */

const ELEM = '*';

/**
 * Build 850 (Purchase Order) segments from structured data.
 */
export function build850Segments(data: {
  poNumber: string;
  poDate: string; // YYYYMMDD
  lines: Array<{
    lineNumber: number;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    itemNumber: string;
    description: string;
  }>;
}): string[] {
  const segments: string[] = [];

  // BEG - Beginning Segment for Purchase Order
  segments.push(['BEG', '00', 'NE', data.poNumber, '', data.poDate].join(ELEM));

  // PO1 lines
  for (const line of data.lines) {
    segments.push([
      'PO1',
      String(line.lineNumber),
      String(line.quantity),
      line.unitOfMeasure || 'EA',
      String(line.unitPrice),
      'PE', // Price Basis: Unit Price
      'VP', // Product ID Qualifier: Vendor Part Number
      line.itemNumber,
    ].join(ELEM));

    // PID - Product/Item Description
    if (line.description) {
      segments.push(['PID', 'F', '', '', '', line.description].join(ELEM));
    }
  }

  // CTT - Transaction Totals
  segments.push(['CTT', String(data.lines.length)].join(ELEM));

  return segments;
}

/**
 * Build 810 (Invoice) segments from structured data.
 */
export function build810Segments(data: {
  invoiceNumber: string;
  invoiceDate: string; // YYYYMMDD
  poNumber: string;
  lines: Array<{
    lineNumber: number;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    itemNumber: string;
  }>;
  totalAmount: number;
}): string[] {
  const segments: string[] = [];

  // BIG - Beginning Segment for Invoice
  segments.push([
    'BIG', data.invoiceDate, data.invoiceNumber,
    '', '', '', data.poNumber,
  ].join(ELEM));

  // IT1 lines
  for (const line of data.lines) {
    segments.push([
      'IT1',
      String(line.lineNumber),
      String(line.quantity),
      line.unitOfMeasure || 'EA',
      String(line.unitPrice),
      '', // Price Basis
      'VP', // Product ID Qualifier
      line.itemNumber,
    ].join(ELEM));
  }

  // TDS - Total Monetary Value Summary (in cents)
  const totalCents = Math.round(data.totalAmount * 100);
  segments.push(['TDS', String(totalCents)].join(ELEM));

  return segments;
}

/**
 * Build 856 (ASN / Advance Ship Notice) segments from structured data.
 */
export function build856Segments(data: {
  shipmentId: string;
  shipDate: string; // YYYYMMDD
  poNumber: string;
  lines: Array<{
    lineNumber: number;
    quantityShipped: number;
    unitOfMeasure: string;
    itemNumber: string;
  }>;
}): string[] {
  const segments: string[] = [];

  // BSN - Beginning Segment for Ship Notice
  segments.push([
    'BSN', '00', data.shipmentId, data.shipDate,
    new Date().toISOString().slice(11, 15).replace(':', ''),
  ].join(ELEM));

  // HL - Hierarchical Level (Shipment level)
  let hlCounter = 1;
  segments.push(['HL', String(hlCounter), '', 'S', '1'].join(ELEM));
  const shipmentHl = hlCounter;
  hlCounter++;

  // PRF - Purchase Order Reference
  segments.push(['PRF', data.poNumber].join(ELEM));

  // HL - Order level
  segments.push(['HL', String(hlCounter), String(shipmentHl), 'O', '1'].join(ELEM));
  const orderHl = hlCounter;
  hlCounter++;

  // Item-level HL segments
  for (const line of data.lines) {
    segments.push(['HL', String(hlCounter), String(orderHl), 'I', '0'].join(ELEM));
    hlCounter++;

    // LIN - Item Identification
    segments.push(['LIN', '', 'VP', line.itemNumber].join(ELEM));

    // SN1 - Item Detail (Shipment)
    segments.push([
      'SN1', String(line.lineNumber),
      String(line.quantityShipped),
      line.unitOfMeasure || 'EA',
    ].join(ELEM));
  }

  return segments;
}

/**
 * Build 997 (Functional Acknowledgment) segments.
 */
export function build997Segments(data: {
  acknowledgedGroupControlNumber: string;
  acknowledgedTransactionType: string;
  accepted: boolean;
}): string[] {
  const segments: string[] = [];

  // AK1 - Functional Group Response Header
  const gsCode = {
    '850': 'PO', '810': 'IN', '856': 'SH', '855': 'PR',
  }[data.acknowledgedTransactionType] || 'ZZ';
  segments.push(['AK1', gsCode, data.acknowledgedGroupControlNumber].join(ELEM));

  // AK9 - Functional Group Response Trailer
  const ackCode = data.accepted ? 'A' : 'R'; // A=Accepted, R=Rejected
  segments.push(['AK9', ackCode, '1', '1', data.accepted ? '1' : '0'].join(ELEM));

  return segments;
}
