import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { usePayStubs } from '../../data-layer/hooks/usePortal';
import type { PayStub } from '@erp/shared';

function formatUSD(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function PayStubDetail({ stub }: { stub: PayStub }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
      {/* Gross Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Earnings</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Regular ({stub.regularHours}h)</span>
            <span className="text-text-primary">{formatUSD(stub.regularPay)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Overtime ({stub.overtimeHours}h)</span>
            <span className="text-text-primary">{formatUSD(stub.overtimePay)}</span>
          </div>
          {stub.bonuses > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Bonuses</span>
              <span className="text-text-primary">{formatUSD(stub.bonuses)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
            <span className="text-text-primary">Gross Pay</span>
            <span className="text-text-primary">{formatUSD(stub.grossPay)}</span>
          </div>
        </div>
      </div>

      {/* Deductions Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Deductions</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Federal Tax</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.federalTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">State Tax</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.stateTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Social Security</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.socialSecurity)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Medicare</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.medicare)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Health Insurance</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.healthInsurance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">401(k)</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.retirementContribution)}</span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Summary</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Gross Pay</span>
            <span className="text-text-primary">{formatUSD(stub.grossPay)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Deductions</span>
            <span className="text-red-600 dark:text-red-400">-{formatUSD(stub.totalDeductions)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5">
            <span className="text-text-primary">Net Pay</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatUSD(stub.netPay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPayPage() {
  const { data: payStubsData } = usePayStubs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stubs = useMemo(() => payStubsData ?? [], [payStubsData]);
  const latestStub = useMemo(() => stubs[0], [stubs]);

  const chartData = useMemo(
    () =>
      [...stubs].reverse().map((s) => ({
        period: s.periodName.split(',')[0],
        gross: s.grossPay,
        net: s.netPay,
      })),
    [stubs]
  );

  const ytdSummary = useMemo(() => {
    if (!latestStub) return null;
    return {
      gross: latestStub.ytdGross,
      net: latestStub.ytdNet,
      taxes: latestStub.ytdTaxes,
    };
  }, [latestStub]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">My Pay</h1>
        <p className="text-xs text-text-muted">View your pay stubs and earnings history</p>
      </div>

      {/* Current Pay Period */}
      {latestStub && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Pay Period</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Latest
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{latestStub.periodName}</p>
                <p className="text-xs text-text-muted">
                  Pay Date: {new Date(latestStub.payDate + 'T12:00:00').toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatUSD(latestStub.netPay)}
                </p>
                <p className="text-xs text-text-muted">Net Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pay Stubs List */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Stubs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stubs.map((stub: PayStub) => (
              <div key={stub.id} className="border border-border rounded-lg">
                <button
                  onClick={() => setExpandedId(expandedId === stub.id ? null : stub.id)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-surface-2 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {expandedId === stub.id ? (
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-text-muted" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-primary">{stub.periodName}</p>
                      <p className="text-xs text-text-muted">
                        Pay Date: {new Date(stub.payDate + 'T12:00:00').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatUSD(stub.netPay)}
                    </p>
                    <p className="text-xs text-text-muted">
                      Gross: {formatUSD(stub.grossPay)}
                    </p>
                  </div>
                </button>
                {expandedId === stub.id && (
                  <div className="px-3 pb-3">
                    <PayStubDetail stub={stub} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* YTD Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => formatUSD(value)}
              />
              <Legend />
              <Bar dataKey="gross" name="Gross Pay" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net Pay" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* YTD Summary */}
      {ytdSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Year-to-Date Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-text-muted">YTD Gross</p>
                <p className="text-lg font-bold text-text-primary">{formatUSD(ytdSummary.gross)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted">YTD Taxes</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatUSD(ytdSummary.taxes)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted">YTD Net</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatUSD(ytdSummary.net)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
