import type { ImportFieldDefinition, ImportSchema, ImportValidationError } from './types';

/**
 * Parse a date string from common formats (ISO, MM/DD/YYYY, DD/MM/YYYY)
 */
function parseDate(value: string): Date | null {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();

  // Try ISO format first
  const isoDate = new Date(trimmed);
  if (!isNaN(isoDate.getTime())) return isoDate;

  // Try MM/DD/YYYY
  const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const mmMatch = trimmed.match(mmddyyyy);
  if (mmMatch) {
    const [, month, day, year] = mmMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const ddMatch = trimmed.match(ddmmyyyy);
  if (ddMatch) {
    const [, day, month, year] = ddMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Parse a boolean from common string representations
 */
function parseBoolean(value: string): boolean | null {
  if (typeof value === 'boolean') return value;
  if (!value || typeof value !== 'string') return null;

  const lower = value.trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].includes(lower)) return true;
  if (['false', 'no', '0', 'n'].includes(lower)) return false;

  return null;
}

/**
 * Validate a single field value against its definition
 */
function validateField(
  value: unknown,
  field: ImportFieldDefinition,
  row: number
): ImportValidationError | null {
  // Check required fields
  if (field.required && (value === null || value === undefined || value === '')) {
    return {
      row,
      field: field.fieldName,
      value: String(value ?? ''),
      message: `${field.label} is required`,
      code: 'REQUIRED'
    };
  }

  // Skip validation for optional empty fields
  if (!field.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  const stringValue = String(value);

  // Type-specific validation
  switch (field.type) {
    case 'string':
      if (field.maxLength && stringValue.length > field.maxLength) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be ${field.maxLength} characters or less`,
          code: 'TOO_LONG'
        };
      }
      break;

    case 'number':
      const num = Number(stringValue);
      if (isNaN(num)) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be a valid number`,
          code: 'INVALID_TYPE'
        };
      }
      if (field.min !== undefined && num < field.min) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be at least ${field.min}`,
          code: 'OUT_OF_RANGE'
        };
      }
      if (field.max !== undefined && num > field.max) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be at most ${field.max}`,
          code: 'OUT_OF_RANGE'
        };
      }
      break;

    case 'boolean':
      const bool = parseBoolean(stringValue);
      if (bool === null) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be true/false, yes/no, or 1/0`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'date':
      const date = parseDate(stringValue);
      if (date === null) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be a valid date (ISO, MM/DD/YYYY, or DD/MM/YYYY)`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'enum':
      if (!field.enumValues || field.enumValues.length === 0) {
        throw new Error(`Field ${field.fieldName} is enum type but has no enumValues`);
      }
      const lowerValue = stringValue.toLowerCase().trim();
      const validValues = field.enumValues.map(v => v.toLowerCase());
      if (!validValues.includes(lowerValue)) {
        return {
          row,
          field: field.fieldName,
          value: stringValue,
          message: `${field.label} must be one of: ${field.enumValues.join(', ')}`,
          code: 'INVALID_ENUM'
        };
      }
      break;
  }

  return null;
}

/**
 * Validate a single row against a schema
 */
export function validateRow(
  row: Record<string, unknown>,
  schema: ImportSchema,
  rowNumber: number = 0
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  for (const field of schema.fields) {
    const value = row[field.fieldName];
    const error = validateField(value, field, rowNumber);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Coerce a row of raw CSV string values to proper types based on schema
 */
export function coerceRow(
  row: Record<string, string>,
  schema: ImportSchema
): Record<string, unknown> {
  const coerced: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const rawValue = row[field.fieldName];

    // Handle missing values
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      if (field.defaultValue !== undefined) {
        coerced[field.fieldName] = field.defaultValue;
      } else {
        coerced[field.fieldName] = null;
      }
      continue;
    }

    // Type-specific coercion
    switch (field.type) {
      case 'string':
        coerced[field.fieldName] = String(rawValue).trim();
        break;

      case 'number':
        const num = Number(rawValue);
        coerced[field.fieldName] = isNaN(num) ? null : num;
        break;

      case 'boolean':
        coerced[field.fieldName] = parseBoolean(rawValue) ?? field.defaultValue ?? null;
        break;

      case 'date':
        const date = parseDate(rawValue);
        coerced[field.fieldName] = date ? date.toISOString() : null;
        break;

      case 'enum':
        // Normalize to match exact enum value (case-insensitive match)
        const lowerValue = String(rawValue).toLowerCase().trim();
        const matchedValue = field.enumValues?.find(v => v.toLowerCase() === lowerValue);
        coerced[field.fieldName] = matchedValue ?? rawValue;
        break;

      default:
        coerced[field.fieldName] = rawValue;
    }
  }

  return coerced;
}
