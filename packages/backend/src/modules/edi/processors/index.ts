export { applyFieldMappings, reverseFieldMappings } from './map-fields.js';
export { parseCsv, generateCsv } from './parse-csv.js';
export { parseXml, generateXml } from './parse-xml.js';
export { process850, process810, process856 } from './edi-to-erp.js';
export { generate850, generate810, generate856, generate997 } from './erp-to-edi.js';

import { parseCsv, generateCsv } from './parse-csv.js';
import { parseXml, generateXml } from './parse-xml.js';
import type { EdiFormat } from '@erp/shared';

/**
 * Parse inbound document content based on format.
 */
export function parseDocument(content: string, format: EdiFormat): Record<string, string>[] {
  switch (format) {
    case 'csv':
      return parseCsv(content);
    case 'xml':
      return parseXml(content);
    case 'json': {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.rows || parsed.data || [parsed];
    }
    case 'x12':
      // X12 parsing handled by x12 module
      throw new Error('X12 format should use the x12 parser module');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Generate outbound document content based on format.
 */
export function generateDocument(
  rows: Record<string, unknown>[],
  format: EdiFormat,
  options?: { rootTag?: string; rowTag?: string }
): string {
  switch (format) {
    case 'csv':
      return generateCsv(rows);
    case 'xml':
      return generateXml(rows, options?.rootTag, options?.rowTag);
    case 'json':
      return JSON.stringify({ data: rows }, null, 2);
    case 'x12':
      // X12 generation handled by x12 module
      throw new Error('X12 format should use the x12 generator module');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
