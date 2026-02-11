/**
 * X12 EDI format generator.
 * Builds compliant ANSI X12 documents from structured data.
 */

export interface X12GeneratorOptions {
  senderId: string;
  receiverId: string;
  senderQualifier?: string;  // Default: 'ZZ'
  receiverQualifier?: string; // Default: 'ZZ'
  elementDelimiter?: string;  // Default: '*'
  segmentDelimiter?: string;  // Default: '~'
  componentDelimiter?: string; // Default: ':'
}

/**
 * Build a complete X12 interchange with a single transaction set.
 */
export function buildX12Interchange(
  transactionType: string,
  businessSegments: string[],
  options: X12GeneratorOptions
): string {
  const elem = options.elementDelimiter || '*';
  const seg = options.segmentDelimiter || '~';
  const comp = options.componentDelimiter || ':';
  const senderQual = options.senderQualifier || 'ZZ';
  const receiverQual = options.receiverQualifier || 'ZZ';

  const controlNumber = generateControlNumber();
  const now = new Date();
  const dateYYMMDD = formatDate6(now);
  const timeHHMM = formatTime4(now);
  const dateCCYYMMDD = formatDate8(now);

  const segments: string[] = [];

  // ISA — Interchange Control Header (fixed 106 chars for ISA fields)
  const isa = [
    'ISA',
    '00',                                    // Authorization Qualifier
    padRight('', 10),                        // Authorization Information
    '00',                                    // Security Qualifier
    padRight('', 10),                        // Security Information
    senderQual,                              // Interchange ID Qualifier (Sender)
    padRight(options.senderId, 15),          // Interchange Sender ID
    receiverQual,                            // Interchange ID Qualifier (Receiver)
    padRight(options.receiverId, 15),        // Interchange Receiver ID
    dateYYMMDD,                              // Interchange Date
    timeHHMM,                                // Interchange Time
    'U',                                     // Repetition Separator
    '00401',                                 // Interchange Control Version
    padLeft(controlNumber, 9, '0'),          // Interchange Control Number
    '0',                                     // Acknowledgment Requested
    'P',                                     // Usage Indicator (P=Production, T=Test)
    comp,                                    // Component Element Separator
  ];
  segments.push(isa.join(elem));

  // GS — Functional Group Header
  const gsCode = getGsFunctionalCode(transactionType);
  const gs = [
    'GS',
    gsCode,
    options.senderId.substring(0, 15),
    options.receiverId.substring(0, 15),
    dateCCYYMMDD,
    timeHHMM,
    controlNumber,
    'X',                                     // Responsible Agency Code
    '004010',                                // Version/Release/Industry Code
  ];
  segments.push(gs.join(elem));

  // ST — Transaction Set Header
  const stControlNumber = padLeft(controlNumber, 4, '0');
  segments.push(['ST', transactionType, stControlNumber].join(elem));

  // Business segments
  segments.push(...businessSegments);

  // SE — Transaction Set Trailer
  const segmentCount = businessSegments.length + 2; // +2 for ST and SE
  segments.push(['SE', String(segmentCount), stControlNumber].join(elem));

  // GE — Functional Group Trailer
  segments.push(['GE', '1', controlNumber].join(elem));

  // IEA — Interchange Control Trailer
  segments.push(['IEA', '1', padLeft(controlNumber, 9, '0')].join(elem));

  return segments.join(seg + '\n') + seg;
}

function getGsFunctionalCode(transactionType: string): string {
  const codes: Record<string, string> = {
    '850': 'PO',  // Purchase Order
    '855': 'PR',  // Purchase Order Acknowledgment
    '810': 'IN',  // Invoice
    '856': 'SH',  // Ship Notice
    '997': 'FA',  // Functional Acknowledgment
  };
  return codes[transactionType] || 'ZZ';
}

function generateControlNumber(): string {
  return String(Math.floor(Math.random() * 999999999) + 1);
}

function formatDate6(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = padLeft(String(date.getMonth() + 1), 2, '0');
  const dd = padLeft(String(date.getDate()), 2, '0');
  return `${yy}${mm}${dd}`;
}

function formatDate8(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = padLeft(String(date.getMonth() + 1), 2, '0');
  const dd = padLeft(String(date.getDate()), 2, '0');
  return `${yyyy}${mm}${dd}`;
}

function formatTime4(date: Date): string {
  const hh = padLeft(String(date.getHours()), 2, '0');
  const mi = padLeft(String(date.getMinutes()), 2, '0');
  return `${hh}${mi}`;
}

function padRight(str: string, len: number, char = ' '): string {
  return str.padEnd(len, char).substring(0, len);
}

function padLeft(str: string, len: number, char = '0'): string {
  return str.padStart(len, char).substring(0, len);
}

export { padLeft, padRight, formatDate8, formatDate6, formatTime4 };
