import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import { getTrialBalance, getChartOfAccounts } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';

export default function GeneralLedgerPage() {
  const trialBalance = useMemo(() => getTrialBalance(), []);
  const accounts = useMemo(() => getChartOfAccounts(), []);

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      asset: 'success',
      liability: 'warning',
      equity: 'info',
      revenue: 'success',
      expense: 'danger',
    };
    return <Badge variant={variants[type] || 'default'}>{type.toUpperCase()}</Badge>;
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'accountNumber',
        header: 'Account #',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.accountNumber}</span>
        ),
      },
      {
        accessorKey: 'accountName',
        header: 'Account Name',
        cell: ({ row }) => (
          <p className="font-medium text-text-primary">{row.original.accountName}</p>
        ),
      },
      {
        accessorKey: 'accountType',
        header: 'Type',
        cell: ({ row }) => getAccountTypeBadge(row.original.accountType),
      },
      {
        accessorKey: 'debit',
        header: 'Debit',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.debit > 0 ? formatCurrency(row.original.debit) : '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'credit',
        header: 'Credit',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.credit > 0 ? formatCurrency(row.original.credit) : '\u2014'}
          </span>
        ),
      },
      {
        id: 'balance',
        header: 'Balance',
        cell: ({ row }) => {
          const balance = row.original.debit - row.original.credit;
          return (
            <span className={`font-medium ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(balance))}
            </span>
          );
        },
      },
    ],
    []
  );

  const totalDebits = trialBalance.reduce((sum, row) => sum + row.debit, 0);
  const totalCredits = trialBalance.reduce((sum, row) => sum + row.credit, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">General Ledger</h1>
        <p className="text-xs text-text-muted">
          View all account balances and trial balance - {accounts.length} accounts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-text-muted">Total Debits</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(totalDebits)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-text-muted">Total Credits</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(totalCredits)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-text-muted">Difference</p>
            <p className={`text-2xl font-bold mt-1 ${totalDebits - totalCredits === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalDebits - totalCredits))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={trialBalance} searchPlaceholder="Search accounts..." />
        </CardContent>
      </Card>
    </div>
  );
}
