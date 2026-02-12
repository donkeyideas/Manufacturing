import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { useCurrencies } from '../../data-layer/hooks/useFinancial';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function CurrenciesPage() {
  const { data: fetchedCurrencies = [] } = useCurrencies();
  const [localCurrencies, setLocalCurrencies] = useState<any[]>([]);
  const currencies = useMemo(() => [...localCurrencies, ...fetchedCurrencies], [localCurrencies, fetchedCurrencies]);

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formExchangeRate, setFormExchangeRate] = useState('');

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormSymbol('');
    setFormExchangeRate('');
  };

  const handleSubmit = () => {
    const newCurrency = {
      code: formCode.toUpperCase(),
      name: formName,
      symbol: formSymbol,
      exchangeRate: parseFloat(formExchangeRate) || 1.0,
      isBase: false,
      isActive: true,
      lastUpdated: '2024-12-15',
    };
    setLocalCurrencies((prev) => [newCurrency, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Currency Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.symbol}</span>
        ),
      },
      {
        accessorKey: 'exchangeRate',
        header: 'Exchange Rate',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.exchangeRate.toFixed(4)}
          </span>
        ),
      },
      {
        accessorKey: 'isBase',
        header: 'Base',
        cell: ({ row }) =>
          row.original.isBase ? (
            <Badge variant="primary">Base</Badge>
          ) : null,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastUpdated',
        header: 'Last Updated',
        cell: ({ row }) => {
          const date = new Date(row.original.lastUpdated);
          return (
            <span className="text-sm text-text-muted">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          );
        },
      },
    ],
    []
  );

  const activeCurrencies = currencies.filter((c) => c.isActive).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Currencies</h1>
          <p className="text-xs text-text-muted">
            Manage currency exchange rates and settings - {activeCurrencies} active currencies
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Currency
        </Button>
      </div>

      {/* Currencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={currencies} searchPlaceholder="Search currencies..." />
        </CardContent>
      </Card>

      {/* New Currency SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Currency"
        description="Add a new currency to the system"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Currency Code</label>
            <input className={INPUT_CLS} placeholder="e.g. AUD" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Currency Name</label>
            <input className={INPUT_CLS} placeholder="e.g. Australian Dollar" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Symbol</label>
            <input className={INPUT_CLS} placeholder="e.g. A$" value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Exchange Rate</label>
            <input type="number" step="0.0001" className={INPUT_CLS} placeholder="1.0000" value={formExchangeRate} onChange={(e) => setFormExchangeRate(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
