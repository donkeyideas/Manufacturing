import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '../Button';

interface ImportValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_ENUM' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'DUPLICATE';
}

interface ResultsStepProps {
  successCount: number;
  errorCount: number;
  errors: ImportValidationError[];
  entityLabel: string;
  onDownloadErrors?: () => void;
}

export function ResultsStep({
  successCount,
  errorCount,
  errors,
  entityLabel,
  onDownloadErrors,
}: ResultsStepProps) {
  const totalCount = successCount + errorCount;
  const isFullSuccess = errorCount === 0;
  const isFullFailure = successCount === 0;

  const Icon = isFullSuccess
    ? CheckCircle
    : isFullFailure
    ? XCircle
    : AlertTriangle;

  const iconColor = isFullSuccess
    ? 'text-emerald-600'
    : isFullFailure
    ? 'text-red-600'
    : 'text-yellow-600';

  const bgColor = isFullSuccess
    ? 'bg-emerald-50'
    : isFullFailure
    ? 'bg-red-50'
    : 'bg-yellow-50';

  const borderColor = isFullSuccess
    ? 'border-emerald-200'
    : isFullFailure
    ? 'border-red-200'
    : 'border-yellow-200';

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Banner */}
        <div className={`p-6 rounded-lg border ${bgColor} ${borderColor}`}>
          <div className="flex flex-col items-center text-center">
            <Icon className={`w-16 h-16 mb-4 ${iconColor}`} />
            {isFullSuccess && (
              <>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                  Import Successful!
                </h3>
                <p className="text-emerald-700">
                  Successfully imported {successCount.toLocaleString()} {entityLabel.toLowerCase()}
                  {successCount !== 1 ? 's' : ''}
                </p>
              </>
            )}
            {isFullFailure && (
              <>
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Import Failed
                </h3>
                <p className="text-red-700">
                  All {totalCount.toLocaleString()} rows had errors
                </p>
              </>
            )}
            {!isFullSuccess && !isFullFailure && (
              <>
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                  Partial Import Completed
                </h3>
                <p className="text-yellow-700">
                  Successfully imported {successCount.toLocaleString()} of{' '}
                  {totalCount.toLocaleString()} {entityLabel.toLowerCase()}
                  {totalCount !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Summary */}
        {errorCount > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface-1 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-text-primary">
                    {errorCount.toLocaleString()} rows had errors
                  </h4>
                  <p className="text-sm text-text-muted mt-1">
                    Review the errors below or download the error report
                  </p>
                </div>
                {onDownloadErrors && (
                  <Button variant="secondary" size="sm" onClick={onDownloadErrors}>
                    Download Error Report
                  </Button>
                )}
              </div>
            </div>

            {/* Error Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-1 border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 w-20">
                      Row
                    </th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Field
                    </th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Value
                    </th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface-0 divide-y divide-border">
                  {errors.slice(0, 10).map((error, idx) => (
                    <tr key={idx} className="hover:bg-surface-1">
                      <td className="px-4 py-3 font-medium text-text-muted">
                        {error.row + 1}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {error.field}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {error.value || '—'}
                      </td>
                      <td className="px-4 py-3 text-red-700">{error.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errors.length > 10 && (
              <div className="bg-surface-1 border-t border-border px-6 py-3 text-center">
                <p className="text-sm text-text-muted">
                  Showing first 10 of {errors.length.toLocaleString()} errors
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
