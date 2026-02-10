import { Check, AlertCircle, Edit2 } from 'lucide-react';
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

interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;
  confidence: 'auto' | 'manual' | 'none';
}

interface MappingStepProps {
  mappings: ColumnMapping[];
  onUpdateMapping: (index: number, targetField: string | null) => void;
  schema: ImportSchema;
  sampleData: Record<string, string>[];
}

export function MappingStep({
  mappings,
  onUpdateMapping,
  schema,
  sampleData,
}: MappingStepProps) {
  const requiredFields = schema.fields.filter((f) => f.required);
  const mappedRequiredCount = requiredFields.filter((f) =>
    mappings.some((m) => m.targetField === f.fieldName)
  ).length;

  const requiredFieldNames = new Set(requiredFields.map((f) => f.fieldName));
  const optionalFields = schema.fields.filter((f) => !f.required);

  const getSampleValue = (sourceColumn: string): string => {
    if (sampleData.length > 0 && sampleData[0][sourceColumn]) {
      const value = sampleData[0][sourceColumn];
      return value.length > 50 ? value.substring(0, 50) + '...' : value;
    }
    return '—';
  };

  const getStatusIcon = (mapping: ColumnMapping) => {
    if (!mapping.targetField) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    if (mapping.confidence === 'auto') {
      return <Check className="w-4 h-4 text-emerald-600" />;
    }
    return <Edit2 className="w-4 h-4 text-blue-600" />;
  };

  const isUnmappedRequired = (mapping: ColumnMapping): boolean => {
    return !mapping.targetField && requiredFieldNames.has(mapping.sourceColumn);
  };

  return (
    <div className="py-6">
      <div className="mb-6 p-4 bg-surface-1 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {mappedRequiredCount} of {requiredFields.length} required fields mapped
            </p>
            <p className="text-xs text-text-muted mt-1">
              Map your CSV columns to {schema.entityLabel.toLowerCase()} fields
            </p>
          </div>
          {mappedRequiredCount === requiredFields.length && (
            <div className="flex items-center gap-2 text-emerald-600">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">All required fields mapped</span>
            </div>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  CSV Column
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Sample Data
                </th>
                <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 w-12">
                  →
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Maps To
                </th>
                <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 w-20">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-0 divide-y divide-border">
              {mappings.map((mapping, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-surface-1',
                    isUnmappedRequired(mapping) && 'bg-red-50'
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">
                    {mapping.sourceColumn}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {getSampleValue(mapping.sourceColumn)}
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted">→</td>
                  <td className="px-4 py-3">
                    <select
                      value={mapping.targetField || ''}
                      onChange={(e) =>
                        onUpdateMapping(index, e.target.value || null)
                      }
                      className={cn(
                        'w-full px-3 py-2 text-sm border rounded-md bg-surface-0 text-text-primary',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isUnmappedRequired(mapping)
                          ? 'border-red-300'
                          : 'border-border'
                      )}
                    >
                      <option value="">— Do not import —</option>
                      <optgroup label="Required Fields">
                        {requiredFields.map((field) => (
                          <option key={field.fieldName} value={field.fieldName}>
                            {field.label}
                            {field.required ? ' *' : ''}
                          </option>
                        ))}
                      </optgroup>
                      {optionalFields.length > 0 && (
                        <optgroup label="Optional Fields">
                          {optionalFields.map((field) => (
                            <option key={field.fieldName} value={field.fieldName}>
                              {field.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusIcon(mapping)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
