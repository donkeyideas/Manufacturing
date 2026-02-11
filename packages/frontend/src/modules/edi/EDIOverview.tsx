import { useMemo } from 'react';
import { ArrowLeftRight, CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { useEDIOverview, useEDITransactions, useEDITradingPartners } from '../../data-layer/hooks/useEDI';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  acknowledged: '#3b82f6',
  processing: '#f59e0b',
  pending: '#8b5cf6',
  failed: '#ef4444',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  '850': 'Purchase Order',
  '855': 'PO Acknowledgment',
  '810': 'Invoice',
  '856': 'ASN',
  '997': 'Func. Ack',
};

const COMM_BADGE: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  as2: 'info',
  sftp: 'success',
  api: 'warning',
  manual: 'default',
  email: 'default',
};

export default function EDIOverview() {
  const { data: overview, isLoading: overviewLoading } = useEDIOverview();
  const { data: transactions = [], isLoading: txnLoading } = useEDITransactions();
  const { data: partners = [] } = useEDITradingPartners();

  const txnByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    (transactions as any[]).forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [transactions]);

  const txnByDay = useMemo(() => {
    const days: Record<string, number> = {};
    (transactions as any[]).forEach((t) => {
      const day = t.documentDate || t.createdAt?.slice(0, 10) || '';
      if (day) days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({
        date: format(new Date(date), 'MMM dd'),
        count,
      }));
  }, [transactions]);

  const recentTxns = useMemo(
    () =>
      [...(transactions as any[])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [transactions],
  );

  const activePartners = useMemo(
    () => (partners as any[]).filter((p) => p.status === 'active' || p.isActive !== false),
    [partners],
  );

  if (overviewLoading || txnLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <div className="h-6 w-48 bg-surface-2 animate-skeleton rounded" />
          <div className="h-3 w-72 bg-surface-2 animate-skeleton rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
        <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton" />
      </div>
    );
  }

  const ov = overview || {} as any;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">EDI Overview</h1>
        <p className="text-xs text-text-muted">
          Electronic Data Interchange — transaction monitoring and partner status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Transactions"
          value={String(ov.totalTransactions ?? transactions.length)}
          icon={<ArrowLeftRight className="h-4 w-4" />}
        />
        <KPICard
          label="Success Rate"
          value={ov.successRate != null ? `${ov.successRate}%` : '-'}
          icon={<CheckCircle className="h-4 w-4" />}
          trendIsPositive={ov.successRate >= 90}
        />
        <KPICard
          label="Pending / Failed"
          value={`${ov.pendingTransactions ?? 0} / ${ov.failedTransactions ?? 0}`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <KPICard
          label="Active Partners"
          value={String(ov.activeTradingPartners ?? activePartners.length)}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {txnByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={txnByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted py-8 text-center">No transaction data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {txnByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={txnByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {txnByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted py-8 text-center">No transaction data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTxns.length === 0 && (
                <p className="text-xs text-text-muted py-4 text-center">No transactions yet</p>
              )}
              {recentTxns.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-surface-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-text-primary">{txn.transactionNumber}</p>
                      <Badge
                        variant={
                          txn.status === 'completed' || txn.status === 'acknowledged'
                            ? 'success'
                            : txn.status === 'failed'
                            ? 'danger'
                            : txn.status === 'processing'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {txn.status}
                      </Badge>
                    </div>
                    <p className="text-2xs text-text-muted mt-0.5">
                      {txn.partnerName} &bull; {DOC_TYPE_LABELS[txn.documentType] || txn.documentType} &bull;{' '}
                      {txn.direction === 'inbound' ? 'IN' : 'OUT'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-text-muted">
                      {txn.documentDate || txn.createdAt?.slice(0, 10) || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Partners */}
        <Card>
          <CardHeader>
            <CardTitle>Active Trading Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activePartners.length === 0 && (
                <p className="text-xs text-text-muted py-4 text-center">No active partners</p>
              )}
              {activePartners.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-surface-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-text-primary">{p.partnerName}</p>
                      <Badge variant={COMM_BADGE[p.communicationMethod] || 'default'}>
                        {(p.communicationMethod || 'manual').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-2xs text-text-muted mt-0.5">
                      {p.partnerCode} &bull; {p.partnerType} &bull; {p.defaultFormat?.toUpperCase() || 'CSV'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status}</Badge>
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
