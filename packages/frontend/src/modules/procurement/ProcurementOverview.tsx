import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, KPICard } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { useProcurementOverview, usePurchaseOrders, useVendors } from '../../data-layer/hooks/useProcurement';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { Truck, DollarSign, Package, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6', '#94a3b8'];

export default function ProcurementOverview() {
  const { isDemo } = useAppMode();
  const { data: overviewData, isLoading: isLoadingOverview } = useProcurementOverview();
  const { data: purchaseOrders = [], isLoading: isLoadingPOs } = usePurchaseOrders();
  const { data: vendors = [], isLoading: isLoadingVendors } = useVendors();

  // Transform overview data based on whether it's demo (rich objects) or live (flat numbers)
  const overview = useMemo(() => {
    if (!overviewData) return null;

    // Demo mode: data has rich objects with label, formattedValue, trend, etc.
    if (isDemo && overviewData.activePOs && typeof overviewData.activePOs === 'object' && 'label' in overviewData.activePOs) {
      return overviewData;
    }

    // Live mode: data has flat numbers, need to transform to KPI format
    return {
      activePOs: {
        label: 'Active POs',
        formattedValue: String(overviewData.activePOs || 0),
        trend: 'stable',
        changePercent: 0,
        trendIsPositive: true,
      },
      totalSpend: {
        label: 'Total Spend',
        formattedValue: formatCurrency(overviewData.totalSpend || 0),
        trend: 'stable',
        changePercent: 0,
        trendIsPositive: true,
      },
      pendingReceipts: {
        label: 'Pending Receipts',
        formattedValue: String(overviewData.pendingReceipts || 0),
        trend: 'stable',
        changePercent: 0,
        trendIsPositive: true,
      },
      activeVendors: {
        label: 'Active Vendors',
        formattedValue: String(overviewData.activeVendors || 0),
        trend: 'stable',
        changePercent: 0,
        trendIsPositive: true,
      },
    };
  }, [overviewData, isDemo]);

  const statusData = useMemo(() => {
    const statusCounts = purchaseOrders.reduce((acc: Record<string, number>, po: any) => {
      acc[po.status] = (acc[po.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    }));
  }, [purchaseOrders]);

  const topVendors = useMemo(() => {
    const vendorSpend = purchaseOrders
      .filter((po: any) => !['draft', 'cancelled'].includes(po.status))
      .reduce((acc: Record<string, number>, po: any) => {
        acc[po.vendorId] = (acc[po.vendorId] || 0) + po.totalAmount;
        return acc;
      }, {} as Record<string, number>);

    return vendors
      .map((vendor: any) => ({
        ...vendor,
        totalSpend: vendorSpend[vendor.id] || 0,
      }))
      .sort((a: any, b: any) => b.totalSpend - a.totalSpend)
      .slice(0, 5);
  }, [purchaseOrders, vendors]);

  if (isLoadingOverview || isLoadingPOs || isLoadingVendors) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <div className="h-6 w-48 bg-surface-100 animate-pulse rounded"></div>
          <div className="h-4 w-80 bg-surface-100 animate-pulse rounded mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-surface-100 animate-pulse rounded"></div>
                  <div className="h-8 w-32 bg-surface-100 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-surface-100 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-surface-100 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-text-muted">No overview data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Procurement Overview</h1>
        <p className="text-xs text-text-muted">Monitor purchasing activities and vendor relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.activePOs.label}
          value={overview.activePOs.formattedValue}
          trend={overview.activePOs.trend}
          trendValue={`${overview.activePOs.changePercent}%`}
          trendIsPositive={overview.activePOs.trendIsPositive}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          label={overview.totalSpend.label}
          value={overview.totalSpend.formattedValue}
          trend={overview.totalSpend.trend}
          trendValue={`${overview.totalSpend.changePercent}%`}
          trendIsPositive={overview.totalSpend.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview.pendingReceipts.label}
          value={overview.pendingReceipts.formattedValue}
          trend={overview.pendingReceipts.trend}
          trendValue={`${overview.pendingReceipts.changePercent}%`}
          trendIsPositive={overview.pendingReceipts.trendIsPositive}
          icon={<Truck className="h-5 w-5" />}
        />
        <KPICard
          label={overview.activeVendors.label}
          value={overview.activeVendors.formattedValue}
          trend={overview.activeVendors.trend}
          trendValue={`${overview.activeVendors.changePercent}%`}
          trendIsPositive={overview.activeVendors.trendIsPositive}
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>PO Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVendors.map((vendor: any, index: number) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950 text-sm font-medium text-brand-700 dark:text-brand-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {(vendor as any).vendorName || (vendor as any).name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {vendor.vendorNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(vendor.totalSpend)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {vendor.paymentTerms}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
