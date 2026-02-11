/**
 * X12 EDI format parser.
 * Parses ANSI X12 documents into structured objects.
 */

export interface X12Interchange {
  senderId: string;
  receiverId: string;
  controlNumber: string;
  functionalGroups: X12FunctionalGroup[];
}

export interface X12FunctionalGroup {
  functionalCode: string;
  senderCode: string;
  receiverCode: string;
  controlNumber: string;
  transactionSets: X12TransactionSet[];
}

export interface X12TransactionSet {
  transactionType: string; // 850, 810, 856, 997, etc.
  controlNumber: string;
  segments: X12Segment[];
}

export interface X12Segment {
  id: string;
  elements: string[];
}

/**
 * Parse raw X12 EDI content into a structured interchange.
 */
export function parseX12(content: string): X12Interchange {
  // Detect delimiters from ISA segment (always 106 chars)
  const elementDelimiter = content.charAt(3); // Usually *
  const segmentDelimiter = detectSegmentDelimiter(content);

  const rawSegments = content
    .split(segmentDelimiter)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const segments: X12Segment[] = rawSegments.map((raw) => {
    const elements = raw.split(elementDelimiter);
    return { id: elements[0], elements: elements.slice(1) };
  });

  // Build interchange structure
  const interchange: X12Interchange = {
    senderId: '',
    receiverId: '',
    controlNumber: '',
    functionalGroups: [],
  };

  let currentGroup: X12FunctionalGroup | null = null;
  let currentSet: X12TransactionSet | null = null;

  for (const seg of segments) {
    switch (seg.id) {
      case 'ISA':
        interchange.senderId = (seg.elements[5] || '').trim();
        interchange.receiverId = (seg.elements[7] || '').trim();
        interchange.controlNumber = (seg.elements[12] || '').trim();
        break;

      case 'GS':
        currentGroup = {
          functionalCode: seg.elements[0] || '',
          senderCode: seg.elements[1] || '',
          receiverCode: seg.elements[2] || '',
          controlNumber: seg.elements[5] || '',
          transactionSets: [],
        };
        interchange.functionalGroups.push(currentGroup);
        break;

      case 'ST':
        currentSet = {
          transactionType: seg.elements[0] || '',
          controlNumber: seg.elements[1] || '',
          segments: [],
        };
        if (currentGroup) currentGroup.transactionSets.push(currentSet);
        break;

      case 'SE':
      case 'GE':
      case 'IEA':
        // Trailer segments — we can validate counts here if needed
        if (seg.id === 'SE') currentSet = null;
        if (seg.id === 'GE') currentGroup = null;
        break;

      default:
        // Business segment — add to current transaction set
        if (currentSet) currentSet.segments.push(seg);
        break;
    }
  }

  return interchange;
}

/**
 * Extract row data from a parsed 850 transaction set.
 */
export function extract850Data(txnSet: X12TransactionSet): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let poNumber = '';
  let poDate = '';
  let customerNumber = '';

  for (const seg of txnSet.segments) {
    switch (seg.id) {
      case 'BEG':
        // BEG*00*NE*PO12345**20240115
        poNumber = seg.elements[2] || '';
        poDate = seg.elements[4] || '';
        break;
      case 'N1':
        // N1*BY*CustomerName*92*CUSTID
        if (seg.elements[0] === 'BY') {
          customerNumber = seg.elements[3] || '';
        }
        break;
      case 'PO1':
        // PO1*1*10*EA*25.50*PE*VP*ITEM-001
        rows.push({
          poNumber,
          poDate,
          customerNumber,
          lineNumber: seg.elements[0] || '',
          quantityOrdered: seg.elements[1] || '',
          unitOfMeasure: seg.elements[2] || '',
          unitPrice: seg.elements[3] || '',
          itemNumber: seg.elements[6] || seg.elements[5] || '',
          itemDescription: '', // May come from PID segment
        });
        break;
      case 'PID':
        // PID*F****Item description text
        if (rows.length > 0) {
          rows[rows.length - 1].itemDescription = seg.elements[4] || '';
        }
        break;
    }
  }

  return rows;
}

/**
 * Extract row data from a parsed 810 transaction set.
 */
export function extract810Data(txnSet: X12TransactionSet): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let invoiceNumber = '';
  let invoiceDate = '';
  let poNumber = '';

  for (const seg of txnSet.segments) {
    switch (seg.id) {
      case 'BIG':
        // BIG*20240115*INV001***20240110*PO001
        invoiceDate = seg.elements[0] || '';
        invoiceNumber = seg.elements[1] || '';
        poNumber = seg.elements[5] || seg.elements[3] || '';
        break;
      case 'IT1':
        // IT1*1*10*EA*25.50**VP*ITEM-001
        rows.push({
          invoiceNumber,
          invoiceDate,
          poNumber,
          lineNumber: seg.elements[0] || '',
          quantity: seg.elements[1] || '',
          unitOfMeasure: seg.elements[2] || '',
          unitPrice: seg.elements[3] || '',
          itemNumber: seg.elements[6] || '',
        });
        break;
      case 'TDS':
        // TDS*2550 (total amount in cents)
        if (rows.length > 0) {
          const totalCents = Number(seg.elements[0] || 0);
          rows[0].totalAmount = String(totalCents / 100);
        }
        break;
    }
  }

  return rows;
}

/**
 * Extract row data from a parsed 856 transaction set.
 */
export function extract856Data(txnSet: X12TransactionSet): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let shipmentId = '';
  let shipDate = '';
  let poNumber = '';

  for (const seg of txnSet.segments) {
    switch (seg.id) {
      case 'BSN':
        // BSN*00*SHIP001*20240115*1200
        shipmentId = seg.elements[1] || '';
        shipDate = seg.elements[2] || '';
        break;
      case 'PRF':
        // PRF*PO001
        poNumber = seg.elements[0] || '';
        break;
      case 'SN1':
        // SN1*1*10*EA
        rows.push({
          shipmentId,
          shipDate,
          poNumber,
          lineNumber: seg.elements[0] || '',
          quantityShipped: seg.elements[1] || '',
          unitOfMeasure: seg.elements[2] || '',
          itemNumber: '', // May come from LIN segment
        });
        break;
      case 'LIN':
        // LIN**VP*ITEM-001
        if (rows.length > 0) {
          rows[rows.length - 1].itemNumber = seg.elements[2] || '';
        }
        break;
    }
  }

  return rows;
}

/**
 * Detect the segment delimiter used in the X12 document.
 */
function detectSegmentDelimiter(content: string): string {
  // ISA is always 106 chars, delimiter is at position 105
  if (content.length >= 106) {
    const delim = content.charAt(105);
    if (delim === '~' || delim === '\n' || delim === '\r') return delim;
  }
  // Fallback: try common delimiters
  if (content.includes('~')) return '~';
  if (content.includes('\n')) return '\n';
  return '~';
}
