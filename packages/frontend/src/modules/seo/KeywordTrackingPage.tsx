import { useMemo } from 'react';
import { Hash, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { getKeywordRankings } from '@erp/demo-data';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

function positionBadgeVariant(pos: number): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  if (pos <= 3) return 'success';
  if (pos <= 10) return 'info';
  if (pos <= 20) return 'warning';
  if (pos <= 50) return 'default';
  return 'danger';
}

function difficultyColor(d: number): string {
  if (d < 30) return '#10b981';
  if (d < 60) return '#f59e0b';
  return '#ef4444';
}

export default function KeywordTrackingPage() {
  const { isDemo } = useAppMode();
  const keywords = useMemo(() => isDemo ? getKeywordRankings() : [], [isDemo]);
  const sorted = useMemo(
    () => [...keywords].sort((a: any, b: any) => a.position - b.position),
    [keywords]
  );

  const totalKeywords = 1247;
  const inTop10 = 295;
  const improved = 487;
  const declined = 198;

  const stats = [
    { label: 'Total Keywords', value: totalKeywords.toLocaleString(), icon: <Hash className="h-4 w-4 text-text-muted" /> },
    { label: 'In Top 10', value: inTop10.toLocaleString(), icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
    { label: 'Improved', value: improved.toLocaleString(), icon: <ArrowUp className="h-4 w-4 text-emerald-500" /> },
    { label: 'Declined', value: declined.toLocaleString(), icon: <ArrowDown className="h-4 w-4 text-red-500" /> },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Keyword Tracking</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Monitor keyword positions and search visibility
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-surface-1 p-4 flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2">
              {s.icon}
            </div>
            <div>
              <p className="text-2xs text-text-muted uppercase tracking-wide font-medium">{s.label}</p>
              <p className="text-xl font-bold text-text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Keyword Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">Keyword</th>
                  <th className="pb-2 pr-4 font-medium text-center">Position</th>
                  <th className="pb-2 pr-4 font-medium text-center">Change</th>
                  <th className="pb-2 pr-4 font-medium text-right">Search Volume</th>
                  <th className="pb-2 pr-4 font-medium">Difficulty</th>
                  <th className="pb-2 pr-4 font-medium text-right">CPC</th>
                  <th className="pb-2 font-medium text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((kw: any, i: number) => {
                  const change = kw.change ?? 0;
                  const trendData = (kw.trend ?? []).map((v: number, idx: number) => ({ v, i: idx }));
                  return (
                    <tr key={i} className="border-b border-border hover:bg-surface-2 transition-colors">
                      <td className="py-2.5 pr-4 text-text-primary font-medium max-w-[200px] truncate">
                        {kw.keyword}
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={positionBadgeVariant(kw.position)}>{kw.position}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        {change > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600">
                            <ArrowUp className="h-3 w-3" />
                            {change}
                          </span>
                        ) : change < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-red-500">
                            <ArrowDown className="h-3 w-3" />
                            {Math.abs(change)}
                          </span>
                        ) : (
                          <span className="text-text-muted">
                            <Minus className="h-3 w-3 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">
                        {kw.searchVolume?.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-surface-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${kw.difficulty}%`,
                                backgroundColor: difficultyColor(kw.difficulty),
                              }}
                            />
                          </div>
                          <span className="text-text-muted">{kw.difficulty}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">
                        ${kw.cpc?.toFixed(2)}
                      </td>
                      <td className="py-2.5">
                        {trendData.length > 1 && (
                          <div className="w-[50px] h-[20px] mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={trendData}>
                                <Line
                                  type="monotone"
                                  dataKey="v"
                                  stroke="#3b82f6"
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
