import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import { useDemandPlanning } from '../../data-layer/hooks/useInventory';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const RISK_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const RISK_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

export default function DemandPlanningPage() {
  const { data: planningData } = useDemandPlanning();
  const data = planningData ?? { demandTrend: [], forecastItems: [] };
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredItems = useMemo(() => {
    if (riskFilter === 'all') return data.forecastItems;
    return data.forecastItems.filter((f: any) => f.stockoutRisk === riskFilter);
  }, [data.forecastItems, riskFilter]);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: 'Item',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.itemName}
          </span>
        ),
      },
      {
        accessorKey: 'currentStock',
        header: 'Current Stock',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {row.original.currentStock.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'avgMonthlyUsage',
        header: 'Avg Monthly Usage',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.avgMonthlyUsage.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'reorderPoint',
        header: 'Reorder Point',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.reorderPoint.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'suggestedOrder',
        header: 'Suggested Order',
        cell: ({ row }) => {
          const val = row.original.suggestedOrder;
          if (val === 0) return <span className="text-sm text-text-muted">-</span>;
          return (
            <span className="text-sm font-medium text-text-primary">
              {val.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'leadTimeDays',
        header: 'Lead Time (days)',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.leadTimeDays}
          </span>
        ),
      },
      {
        accessorKey: 'stockoutRisk',
        header: 'Stockout Risk',
        cell: ({ row }) => {
          const risk = row.original.stockoutRisk as string;
          return (
            <Badge variant={RISK_VARIANT[risk] ?? 'default'}>
              {RISK_LABEL[risk] ?? risk}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          Demand Planning
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Inventory demand forecasting and reorder recommendations
        </p>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const totalForecast = data.forecastItems.length;
        const atRisk = data.forecastItems.filter((f: any) => f.stockoutRisk === 'high' || f.stockoutRisk === 'critical').length;
        const needsReorder = data.forecastItems.filter((f: any) => f.suggestedOrder > 0).length;
        const critical = data.forecastItems.filter((f: any) => f.stockoutRisk === 'critical').length;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Forecast Items</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalForecast.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Needs Reorder</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{needsReorder.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">At Risk</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{atRisk.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Critical</p>
                  <p className="text-2xl font-bold text-red-700 mt-2">{critical.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Demand vs Fulfilled Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand vs Fulfilled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.demandTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={formatCompact} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                  contentStyle={{ fontSize: 12, backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '6px' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Area
                  type="monotone"
                  dataKey="demand"
                  name="Demand"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />
                <Area
                  type="monotone"
                  dataKey="fulfilled"
                  name="Fulfilled"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Forecast Items</CardTitle>
            <select className={INPUT_CLS + ' !w-auto'} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="all">All Risks</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={filteredItems}
            searchable
            searchPlaceholder="Search items..."
            pageSize={15}
            emptyMessage="No forecast items found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
