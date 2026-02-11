import { useState, useMemo } from 'react';
import { Upload, Database, CheckCircle, AlertCircle, ArrowRight, Download, FileSpreadsheet, ShieldAlert, X } from 'lucide-react';
import { Card, CardContent, Button, Badge, ImportWizard, ProgressBar } from '@erp/ui';
import { ALL_IMPORT_SCHEMAS, getMissingDependencies, validateRow, coerceRow } from '@erp/shared';
import type { ImportSchema, ImportValidationError } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate } from '../../utils/export-utils';

interface MigrationHistoryEntry {
  date: string;
  entityType: string;
  entityLabel: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
}

const MODULE_COLORS: Record<string, string> = {
  inventory: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  sales: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  procurement: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  hr: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  financial: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  assets: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  manufacturing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
};

export default function DataMigrationPage() {
  const [activeSchema, setActiveSchema] = useState<ImportSchema | null>(null);
  const [dependencyWarning, setDependencyWarning] = useState<{
    schema: ImportSchema;
    missing: { entityType: string; entityLabel: string }[];
  } | null>(null);
  const [importHistory, setImportHistory] = useState<MigrationHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('erp-migration-history') || '[]');
    } catch {
      return [];
    }
  });

  const handleImportComplete = (
    schema: ImportSchema,
    success: number,
    errors: number,
    total: number
  ) => {
    const entry: MigrationHistoryEntry = {
      date: new Date().toISOString(),
      entityType: schema.entityType,
      entityLabel: schema.entityLabel,
      totalRows: total,
      successCount: success,
      errorCount: errors,
    };
    const updated = [entry, ...importHistory];
    setImportHistory(updated);
    localStorage.setItem('erp-migration-history', JSON.stringify(updated));
  };

  const importedEntities = useMemo(() => {
    return new Set(importHistory.map((h) => h.entityType));
  }, [importHistory]);

  const completedCount = importedEntities.size;
  const totalCount = ALL_IMPORT_SCHEMAS.length;

  const handleImportClick = (schema: ImportSchema) => {
    const missing = getMissingDependencies(schema, importedEntities);
    if (missing.length > 0) {
      setDependencyWarning({ schema, missing });
    } else {
      setActiveSchema(schema);
    }
  };

  const handleProceedAnyway = () => {
    if (dependencyWarning) {
      setActiveSchema(dependencyWarning.schema);
      setDependencyWarning(null);
    }
  };

  const handleGoToPrerequisite = (entityType: string) => {
    setDependencyWarning(null);
    const schema = ALL_IMPORT_SCHEMAS.find(s => s.entityType === entityType);
    if (schema) {
      setActiveSchema(schema);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Data Migration Center</h1>
          <p className="text-text-muted mt-1">
            Import data from your previous system. Follow the recommended order below — master data
            first, then transactional data.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Migration Progress</span>
            <span className="text-sm text-text-muted">
              {completedCount} of {totalCount} modules imported
            </span>
          </div>
          <ProgressBar value={completedCount} max={totalCount} className="h-2" />
        </CardContent>
      </Card>

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_IMPORT_SCHEMAS.map((schema) => {
          const isImported = importedEntities.has(schema.entityType);
          const moduleColor =
            MODULE_COLORS[schema.module.toLowerCase()] || 'bg-gray-100 text-gray-700';
          const missing = getMissingDependencies(schema, importedEntities);
          const hasMissingDeps = missing.length > 0 && !isImported;

          return (
            <Card
              key={schema.entityType}
              className={`hover:shadow-md transition-shadow ${
                hasMissingDeps ? 'border-amber-300 dark:border-amber-700' : ''
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Module and Order */}
                <div className="flex items-center justify-between">
                  <Badge className={`${moduleColor} text-xs`}>{schema.module}</Badge>
                  <span className="text-xs text-text-muted">#{schema.migrationOrder}</span>
                </div>

                {/* Entity Label */}
                <div>
                  <h3 className="font-semibold text-foreground">{schema.entityLabel}</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">
                    {schema.description}
                  </p>
                </div>

                {/* Dependencies Warning */}
                {hasMissingDeps && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-medium">Requires: </span>
                      {missing.map((dep, i) => (
                        <span key={dep.entityType}>
                          {i > 0 && ', '}
                          {dep.entityLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Count */}
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{schema.fields.length} fields</span>
                  {schema.dependencies && schema.dependencies.length > 0 && (
                    <>
                      <span className="text-border">|</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{schema.dependencies.length} prerequisite{schema.dependencies.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {isImported ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Imported
                    </Badge>
                  ) : (
                    <Badge className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not Started
                    </Badge>
                  )}
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleImportClick(schema)}
                    className="text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </Button>
                </div>

                {/* Download Template Link */}
                <button
                  onClick={() => downloadTemplate(schema)}
                  className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 py-1"
                >
                  <Download className="w-3 h-3" />
                  Download Template
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Migration History */}
      {importHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Migration History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-text-muted">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-text-muted">Entity</th>
                    <th className="text-right py-2 px-3 font-medium text-text-muted">
                      Total Rows
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-text-muted">Success</th>
                    <th className="text-right py-2 px-3 font-medium text-text-muted">Errors</th>
                    <th className="text-center py-2 px-3 font-medium text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importHistory.map((entry, idx) => {
                    const hasErrors = entry.errorCount > 0;
                    return (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="py-2 px-3 text-text-muted">
                          {new Date(entry.date).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-medium text-foreground">
                          {entry.entityLabel}
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          {entry.totalRows}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                          {entry.successCount}
                        </td>
                        <td className="py-2 px-3 text-right text-red-600 dark:text-red-400">
                          {entry.errorCount}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {hasErrors ? (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                              Partial
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              Success
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependency Warning Modal */}
      {dependencyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-0 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-amber-50 dark:bg-amber-950/30">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-foreground">Missing Prerequisites</h3>
              <button
                onClick={() => setDependencyWarning(null)}
                className="ml-auto p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-text-secondary">
                <strong>{dependencyWarning.schema.entityLabel}</strong> depends on data that
                hasn't been imported yet. Importing without prerequisites may cause errors
                (missing references, broken links).
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Missing imports:
                </p>
                {dependencyWarning.missing.map((dep) => (
                  <div
                    key={dep.entityType}
                    className="flex items-center justify-between p-2 rounded-md border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-foreground">
                        {dep.entityLabel}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleGoToPrerequisite(dep.entityType)}
                      className="text-xs"
                    >
                      Import this first
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDependencyWarning(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleProceedAnyway}
                  className="flex-1"
                >
                  Proceed Anyway
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Wizard */}
      {activeSchema && (
        <ImportWizard
          open={!!activeSchema}
          onClose={() => setActiveSchema(null)}
          schema={activeSchema}
          onParseFile={parseFile}
          onAutoMap={autoMapColumns}
          onValidateRows={(rows, mappings, schema) => {
            const validData: Record<string, unknown>[] = [];
            const errors: ImportValidationError[] = [];
            rows.forEach((row, i) => {
              const mapped: Record<string, string> = {};
              mappings.forEach((m) => {
                if (m.targetField && m.sourceColumn) {
                  mapped[m.targetField] = row[m.sourceColumn] || '';
                }
              });
              const coerced = coerceRow(mapped, schema);
              const rowErrors = validateRow(coerced, schema);
              if (rowErrors.length > 0) {
                errors.push(...rowErrors.map((e) => ({ ...e, row: i + 2 })));
              } else {
                validData.push(coerced);
              }
            });
            return { validData, errors };
          }}
          onImport={async (data) => {
            // In demo mode, just record success
            handleImportComplete(activeSchema, data.length, 0, data.length);
            return { success: data.length, errors: [] };
          }}
          onDownloadTemplate={() => downloadTemplate(activeSchema)}
        />
      )}
    </div>
  );
}
