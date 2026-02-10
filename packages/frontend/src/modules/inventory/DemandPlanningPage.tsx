import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import { getDemandPlanningData } from '@erp/demo-data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';

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

export default function DemandPlanningPage() {
  const data = useMemo(() => getDemandPlanningData(), []);

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
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
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
          <CardTitle>Forecast Items</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data.forecastItems}
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
