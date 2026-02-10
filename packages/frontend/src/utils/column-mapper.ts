import type { ImportSchema, ColumnMapping } from '@erp/shared';

function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s_\-#*./]+/g, '').trim();
}

export function autoMapColumns(csvHeaders: string[], schema: ImportSchema): ColumnMapping[] {
  return csvHeaders.map((header) => {
    const normalizedHeader = normalize(header);

    // Try exact alias match first (case-insensitive, normalized)
    for (const field of schema.fields) {
      for (const alias of field.aliases) {
        if (normalize(alias) === normalizedHeader) {
          return { sourceColumn: header, targetField: field.fieldName, confidence: 'auto' as const };
        }
      }
    }

    // Try fieldName match
    for (const field of schema.fields) {
      if (normalize(field.fieldName) === normalizedHeader) {
        return { sourceColumn: header, targetField: field.fieldName, confidence: 'auto' as const };
      }
    }

    // Try label match
    for (const field of schema.fields) {
      if (normalize(field.label) === normalizedHeader) {
        return { sourceColumn: header, targetField: field.fieldName, confidence: 'auto' as const };
      }
    }

    return { sourceColumn: header, targetField: null, confidence: 'none' as const };
  });
}
