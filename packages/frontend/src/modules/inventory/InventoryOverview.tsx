import { useMemo } from 'react';
import { Package, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import {
  getInventoryOverview,
  getWarehouses,
  getInventoryOnHand,
  getItems,
} from '@erp/demo-data';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function InventoryOverview() {
  const overview = useMemo(() => getInventoryOverview(), []);
  const warehouses = useMemo(() => getWarehouses(), []);
  const inventoryOnHand = useMemo(() => getInventoryOnHand(), []);
  const items = useMemo(() => getItems(), []);

  // Calculate inventory value by warehouse
  const warehouseData = useMemo(() => {
    const valueByWarehouse = new Map<string, { name: string; value: number }>();

    inventoryOnHand.forEach((ioh) => {
      const current = valueByWarehouse.get(ioh.warehouseId) || { name: ioh.warehouseName || '', value: 0 };
      current.value += ioh.totalCost;
      valueByWarehouse.set(ioh.warehouseId, current);
    });

    return Array.from(valueByWarehouse.values());
  }, [inventoryOnHand]);

  // Find low stock items
  const lowStockItems = useMemo(() => {
    const itemsMap = new Map(items.map(i => [i.id, i]));
    const lowStock: Array<{ itemNumber: string; itemName: string; quantity: number; reorderPoint: number; warehouse: string }> = [];

    inventoryOnHand.forEach((ioh) => {
      const item = itemsMap.get(ioh.itemId);
      if (item && item.reorderPoint && ioh.quantity < item.reorderPoint) {
        lowStock.push({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: ioh.quantity,
          reorderPoint: item.reorderPoint,
          warehouse: ioh.warehouseName || '',
        });
      }
    });

    return lowStock.sort((a, b) => (a.quantity - a.reorderPoint) - (b.quantity - b.reorderPoint));
  }, [items, inventoryOnHand]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Inventory Overview</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Track inventory levels, warehouses, and stock alerts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalItems.label}
          value={overview.totalItems.formattedValue}
          icon={<Package className="h-4 w-4" />}
          trend={overview.totalItems.trend}
          trendValue={`${overview.totalItems.changePercent}%`}
          trendIsPositive={overview.totalItems.trendIsPositive}
        />
        <KPICard
          label={overview.totalValue.label}
          value={overview.totalValue.formattedValue}
          icon={<DollarSign className="h-4 w-4" />}
          trend={overview.totalValue.trend}
          trendValue={`${overview.totalValue.changePercent}%`}
          trendIsPositive={overview.totalValue.trendIsPositive}
        />
        <KPICard
          label={overview.lowStockItems.label}
          value={overview.lowStockItems.formattedValue}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={overview.lowStockItems.trend}
          trendValue={`${overview.lowStockItems.changePercent}%`}
          trendIsPositive={overview.lowStockItems.trendIsPositive}
        />
        <KPICard
          label={overview.warehouseCount.label}
          value={overview.warehouseCount.formattedValue}
          icon={<Building2 className="h-4 w-4" />}
          trend={overview.warehouseCount.trend}
          trendValue={`${overview.warehouseCount.changePercent}%`}
          trendIsPositive={overview.warehouseCount.trendIsPositive}
        />
      </div>

      {/* Warehouse Value Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Value by Warehouse */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value by Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-0)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Bar dataKey="value" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Badge variant="danger">{lowStockItems.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  No low stock items
                </p>
              ) : (
                lowStockItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-md p-2.5 hover:bg-surface-2 transition-colors border border-border"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {item.itemNumber}
                        </p>
                        <Badge variant="danger" className="text-2xs">
                          {item.quantity} / {item.reorderPoint}
                        </Badge>
                      </div>
                      <p className="text-2xs text-text-muted mt-0.5 truncate">
                        {item.itemName}
                      </p>
                      <p className="text-2xs text-text-muted mt-0.5">
                        {item.warehouse}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {warehouses.map((wh) => {
              const whInventory = inventoryOnHand.filter((ioh) => ioh.warehouseId === wh.id);
              const totalValue = whInventory.reduce((sum, ioh) => sum + ioh.totalCost, 0);
              const itemCount = whInventory.length;

              return (
                <div
                  key={wh.id}
                  className="rounded-md border border-border p-3 hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-brand-500" />
                    <p className="text-xs font-semibold text-text-primary">
                      {wh.warehouseCode}
                    </p>
                    {wh.isDefault && (
                      <Badge variant="info" className="text-2xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-2xs text-text-muted mb-1">{wh.warehouseName}</p>
                  <p className="text-2xs text-text-muted mb-2">
                    {wh.city}, {wh.state}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-2xs text-text-muted">{itemCount} items</span>
                    <span className="text-xs font-medium text-text-primary">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
