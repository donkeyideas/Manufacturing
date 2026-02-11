import type { EdiFieldMapping } from '@erp/shared';

/**
 * Apply field mapping rules to transform source data rows into target format.
 */
export function applyFieldMappings(
  rows: Record<string, unknown>[],
  mappings: EdiFieldMapping[]
): Record<string, unknown>[] {
  return rows.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const rule of mappings) {
      let value: unknown = row[rule.sourceField];

      // Use default if source value is missing
      if (value === undefined || value === null || value === '') {
        if (rule.defaultValue !== undefined) {
          value = rule.defaultValue;
        } else {
          continue;
        }
      }

      // Apply transform
      if (rule.transform && typeof value === 'string') {
        switch (rule.transform) {
          case 'uppercase':
            value = value.toUpperCase();
            break;
          case 'lowercase':
            value = value.toLowerCase();
            break;
          case 'trim':
            value = value.trim();
            break;
          case 'number': {
            const num = Number(value);
            value = isNaN(num) ? 0 : num;
            break;
          }
          case 'date':
            // Attempt ISO date parse
            value = new Date(value).toISOString().split('T')[0];
            break;
          case 'boolean':
            value = ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
            break;
        }
      }

      mapped[rule.targetField] = value;
    }

    return mapped;
  });
}

/**
 * Reverse field mappings — used for outbound document generation.
 * Takes ERP fields and maps them to the partner's expected field names.
 */
export function reverseFieldMappings(
  rows: Record<string, unknown>[],
  mappings: EdiFieldMapping[]
): Record<string, unknown>[] {
  return rows.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const rule of mappings) {
      let value: unknown = row[rule.targetField];
      if (value === undefined || value === null) continue;

      // Apply transform for outbound
      if (rule.transform && typeof value === 'string') {
        switch (rule.transform) {
          case 'uppercase':
            value = value.toUpperCase();
            break;
          case 'lowercase':
            value = value.toLowerCase();
            break;
          case 'trim':
            value = value.trim();
            break;
        }
      }

      mapped[rule.sourceField] = value;
    }

    return mapped;
  });
}
