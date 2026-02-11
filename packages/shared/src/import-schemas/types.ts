export interface ImportFieldDefinition {
  fieldName: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  required: boolean;
  enumValues?: string[];
  enumLabels?: Record<string, string>;
  min?: number;
  max?: number;
  maxLength?: number;
  defaultValue?: unknown;
  aliases: string[];
  helpText?: string;
}

export interface ImportSchema {
  entityType: string;
  entityLabel: string;
  module: string;
  fields: ImportFieldDefinition[];
  apiEndpoint: string;
  templateFilename: string;
  description: string;
  migrationOrder: number;
  /** Entity types that must be imported before this one (foreign key dependencies) */
  dependencies?: string[];
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_ENUM' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'DUPLICATE';
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportValidationError[];
  data: Record<string, unknown>[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;
  confidence: 'auto' | 'manual' | 'none';
}
