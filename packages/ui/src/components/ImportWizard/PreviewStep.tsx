import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../Badge';
import { cn } from '../../lib/utils';

interface ImportFieldDefinition {
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

interface ImportSchema {
  entityType: string;
  entityLabel: string;
  module: string;
  fields: ImportFieldDefinition[];
  apiEndpoint: string;
  templateFilename: string;
  description: string;
  migrationOrder: number;
}

interface ImportValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_ENUM' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'DUPLICATE';
}

interface PreviewStepProps {
  validData: Record<string, unknown>[];
  errors: ImportValidationError[];
  schema: ImportSchema;
  totalRows: number;
}

export function PreviewStep({ validData, errors, schema, totalRows }: PreviewStepProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'errors'>('all');
  const validCount = validData.length;
  const errorCount = errors.length;

  const errorRowNumbers = new Set(errors.map((e) => e.row));
  const errorsByRow = errors.reduce((acc, error) => {
    if (!acc[error.row]) acc[error.row] = [];
    acc[error.row].push(error);
    return acc;
  }, {} as Record<number, ImportValidationError[]>);

  const displayData =
    activeTab === 'errors'
      ? validData.filter((_, idx) => errorRowNumbers.has(idx))
      : validData.slice(0, 50);

  const displayFields = schema.fields.filter((f) => f.required).slice(0, 8);

  const getCellErrors = (rowIndex: number, fieldName: string): ImportValidationError[] => {
    const rowErrors = errorsByRow[rowIndex] || [];
    return rowErrors.filter((e) => e.field === fieldName);
  };

  const isErrorRow = (rowIndex: number): boolean => errorRowNumbers.has(rowIndex);

  return (
    <div className="py-6">
      {/* Summary Bar */}
      <div className="mb-6 p-4 bg-surface-1 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {validCount.toLocaleString()} rows valid
                </p>
              </div>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {errorCount.toLocaleString()} rows with errors
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={validCount > 0 ? 'success' : 'default'}>
              {validCount} valid
            </Badge>
            {errorCount > 0 && <Badge variant="danger">{errorCount} errors</Badge>}
          </div>
        </div>
      </div>

      {/* All rows valid message */}
      {errorCount === 0 && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">
                All {totalRows.toLocaleString()} rows passed validation
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Your data is ready to import
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="mb-4 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            All Rows ({validData.length})
          </button>
          {errorCount > 0 && (
            <button
              onClick={() => setActiveTab('errors')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'errors'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              )}
            >
              Errors Only ({errorCount})
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 w-16">
                  Row
                </th>
                {displayFields.map((field) => (
                  <th
                    key={field.fieldName}
                    className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-surface-0 divide-y divide-border">
              {displayData.map((row, idx) => {
                const actualRowIndex = activeTab === 'errors'
                  ? Array.from(errorRowNumbers)[idx]
                  : idx;
                const hasError = isErrorRow(actualRowIndex);

                return (
                  <tr
                    key={idx}
                    className={cn(
                      'hover:bg-surface-1',
                      hasError && 'bg-red-50'
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">
                      {actualRowIndex + 1}
                    </td>
                    {displayFields.map((field) => {
                      const cellErrors = getCellErrors(actualRowIndex, field.fieldName);
                      const cellValue = row[field.fieldName];
                      const displayValue =
                        cellValue != null ? String(cellValue) : '—';

                      return (
                        <td
                          key={field.fieldName}
                          className="px-4 py-3 text-text-primary relative group"
                        >
                          <div className="flex items-center gap-2">
                            {cellErrors.length > 0 && (
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-xs">
                              {displayValue.length > 50
                                ? displayValue.substring(0, 50) + '...'
                                : displayValue}
                            </span>
                          </div>
                          {cellErrors.length > 0 && (
                            <div className="absolute hidden group-hover:block z-10 bg-red-900 text-white text-xs rounded px-2 py-1 -top-1 left-0 whitespace-nowrap">
                              {cellErrors[0].message}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {validData.length > 50 && activeTab === 'all' && (
        <p className="text-sm text-text-muted text-center mt-4">
          Showing first 50 of {validData.length.toLocaleString()} rows
        </p>
      )}
    </div>
  );
}
