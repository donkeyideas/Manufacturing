import { useGLMappings, type GLMapping } from '../data-layer/hooks/useFinancial';
import { useAppMode } from '../data-layer/providers/AppModeProvider';
import { formatCurrency } from '@erp/shared';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';

interface GLAccountStripProps {
  module: string;
}

function GLBadge({ label, mapping }: { label: string; mapping: GLMapping }) {
  const isOk = mapping.status === 'ok';
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
        isOk
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
      }`}
    >
      {isOk ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
      )}
      <span className="font-semibold">{mapping.accountNumber}</span>
      <span className="hidden sm:inline text-[10px] opacity-75">{label}</span>
      {isOk && (
        <span className={`ml-1 font-mono text-[11px] ${mapping.balance !== 0 ? 'text-emerald-700 dark:text-emerald-300' : 'opacity-60'}`}>
          {formatCurrency(mapping.balance)}
        </span>
      )}
      {!isOk && <span className="ml-1 text-[10px]">MISSING</span>}
    </div>
  );
}

export default function GLAccountStrip({ module }: GLAccountStripProps) {
  const { isDemo } = useAppMode();
  const { data: mappings, isLoading } = useGLMappings();

  // Don't show in demo mode
  if (isDemo) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2">
        <BookOpen className="h-4 w-4 text-text-muted" />
        <span className="text-xs text-text-muted">Loading GL accounts...</span>
      </div>
    );
  }

  const moduleAccounts = mappings?.[module];
  if (!moduleAccounts || Object.keys(moduleAccounts).length === 0) return null;

  const entries = Object.entries(moduleAccounts);
  const allOk = entries.every(([, m]) => m.status === 'ok');
  const hasActivity = entries.some(([, m]) => m.status === 'ok' && m.balance !== 0);

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3 py-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-1">
          <BookOpen className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-medium text-text-muted whitespace-nowrap">GL Links</span>
          {allOk && hasActivity && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Synced
            </span>
          )}
          {allOk && !hasActivity && (
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">No Activity</span>
          )}
          {!allOk && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-3 w-3" /> Missing Accounts
            </span>
          )}
        </div>
        {entries.map(([label, mapping]) => (
          <GLBadge key={label} label={label} mapping={mapping as GLMapping} />
        ))}
      </div>
    </div>
  );
}
