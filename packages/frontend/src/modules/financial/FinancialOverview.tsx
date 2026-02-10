import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@erp/ui';
import { getFinancialOverview, getRecentTransactions } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { DollarSign, TrendingDown, Wallet, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function FinancialOverview() {
  const overview = useMemo(() => getFinancialOverview(), []);
  const recentTransactions = useMemo(() => getRecentTransactions(), []);

  const chartData = useMemo(() => [
    { month: 'Aug', revenue: 2420000, expenses: 1780000 },
    { month: 'Sep', revenue: 2580000, expenses: 1850000 },
    { month: 'Oct', revenue: 2690000, expenses: 1920000 },
    { month: 'Nov', revenue: 2530000, expenses: 1780000 },
    { month: 'Dec', revenue: 2780000, expenses: 1950000 },
    { month: 'Jan', revenue: 2847500, expenses: 1923400 },
  ], []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'expense':
      case 'payment':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded";
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Financial Overview</h1>
        <p className="text-xs text-text-muted">Monitor your financial performance and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalRevenue.label}
          value={overview.totalRevenue.formattedValue}
          trend={overview.totalRevenue.trend}
          trendValue={`${overview.totalRevenue.changePercent}%`}
          trendIsPositive={overview.totalRevenue.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview.totalExpenses.label}
          value={overview.totalExpenses.formattedValue}
          trend={overview.totalExpenses.trend}
          trendValue={`${overview.totalExpenses.changePercent}%`}
          trendIsPositive={!overview.totalExpenses.trendIsPositive}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <KPICard
          label={overview.netIncome.label}
          value={overview.netIncome.formattedValue}
          trend={overview.netIncome.trend}
          trendValue={`${overview.netIncome.changePercent}%`}
          trendIsPositive={overview.netIncome.trendIsPositive}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          label={overview.cashBalance.label}
          value={overview.cashBalance.formattedValue}
          trend={overview.cashBalance.trend}
          trendValue={`${overview.cashBalance.changePercent}%`}
          trendIsPositive={overview.cashBalance.trendIsPositive}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue vs Expenses
            </CardTitle>
            <span className="text-xs text-text-muted">Last 6 months</span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-full bg-surface-1">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-text-muted">{transaction.accountName}</p>
                      <span className="text-xs text-text-muted">•</span>
                      <p className="text-xs text-text-muted">{transaction.referenceNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(transaction.status)}
                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === 'revenue'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'revenue' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
