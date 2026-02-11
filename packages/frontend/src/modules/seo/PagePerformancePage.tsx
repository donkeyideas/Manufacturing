import { useMemo } from 'react';
import { Gauge, Smartphone, FileSearch, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { getPagePerformance } from '@erp/demo-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--surface-1)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
};

const VITAL_META: Record<string, { fullName: string; icon: any }> = {
  LCP: { fullName: 'Largest Contentful Paint', icon: Clock },
  FID: { fullName: 'First Input Delay', icon: Gauge },
  CLS: { fullName: 'Cumulative Layout Shift', icon: FileSearch },
  INP: { fullName: 'Interaction to Next Paint', icon: Smartphone },
};

function statusVariant(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'good') return 'success';
  if (status === 'needs improvement' || status === 'needs_improvement') return 'warning';
  return 'danger';
}

const CRAWL_COLORS: Record<string, string> = {
  indexed: '#10b981',
  notIndexed: '#f59e0b',
  errors: '#ef4444',
  redirects: '#3b82f6',
  blocked: '#6b7280',
};

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export default function PagePerformancePage() {
  const { isDemo } = useAppMode();
  const data = useMemo(() => isDemo ? getPagePerformance() : null, [isDemo]);
  const vitalsObj = data?.coreWebVitals;
  const vitals = vitalsObj ? [
    { metric: 'LCP', value: vitalsObj.lcp.value, status: vitalsObj.lcp.rating },
    { metric: 'FID', value: vitalsObj.fid.value, status: vitalsObj.fid.rating },
    { metric: 'CLS', value: vitalsObj.cls.value, status: vitalsObj.cls.rating },
    { metric: 'INP', value: vitalsObj.inp.value, status: vitalsObj.inp.rating },
  ] : [];
  const crawlHealth = data?.crawlHealth ?? {};
  const scores = data?.pageSpeedScores ?? [];

  const crawlData = useMemo(() => {
    return Object.entries(crawlHealth)
      .filter(([key]) => key !== 'total')
      .map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        value: value as number,
        fill: CRAWL_COLORS[key] ?? '#6b7280',
      }));
  }, [crawlHealth]);

  const crawlTotal = crawlData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Page Performance</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Technical SEO health and Core Web Vitals
        </p>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v: any) => {
          const meta = VITAL_META[v.metric] ?? VITAL_META.LCP;
          const Icon = meta.icon;
          return (
            <div
              key={v.metric}
              className="rounded-lg border border-border bg-surface-1 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {v.metric}
                </span>
                <Icon className="h-4 w-4 text-text-muted" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{v.value}</p>
              <p className="text-2xs text-text-muted">{meta.fullName}</p>
              <Badge variant={statusVariant(v.status)}>{v.status.replace(/_/g, ' ')}</Badge>
            </div>
          );
        })}
      </div>

      {/* Two-column: Crawl Health + Mobile & Sitemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crawl Health Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Crawl Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={crawlData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {crawlData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    formatter={(value) => (
                      <span className="text-xs text-text-secondary">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 40 }}>
                <div className="text-center">
                  <p className="text-xl font-bold text-text-primary">{crawlTotal.toLocaleString()}</p>
                  <p className="text-2xs text-text-muted">Total Pages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile & Sitemap */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile & Sitemap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mobile Usability Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none" stroke="#10b981" strokeWidth="8"
                    strokeDasharray={`${(data?.mobileUsability?.score ?? (isDemo ? 92 : 0)) / 100 * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <span className="absolute text-xl font-bold text-text-primary">
                  {data?.mobileUsability?.score ?? (isDemo ? 92 : 0)}%
                </span>
              </div>
              <p className="text-xs text-text-muted">Mobile Usability Score</p>
            </div>

            {/* Sitemap Info */}
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Sitemap Status</span>
                <Badge variant="success">Submitted</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">URLs in Sitemap</span>
                <span className="text-text-primary font-medium">
                  {data?.sitemapStatus?.urls?.toLocaleString() ?? (isDemo ? '2,847' : '0')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Last Crawl</span>
                <span className="text-text-primary font-medium">
                  {data?.sitemapStatus?.lastCrawled ?? (isDemo ? '2 hours ago' : '--')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Speed Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Speed Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">URL</th>
                  <th className="pb-2 pr-4 font-medium text-center">Mobile Score</th>
                  <th className="pb-2 pr-4 font-medium text-center">Desktop Score</th>
                  <th className="pb-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((page: any, i: number) => (
                  <tr key={i} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 pr-4 text-text-primary font-medium max-w-[280px] truncate">
                      {page.url}
                    </td>
                    <td className={`py-2.5 pr-4 text-center font-semibold ${scoreColor(page.mobile)}`}>
                      {page.mobile}
                    </td>
                    <td className={`py-2.5 pr-4 text-center font-semibold ${scoreColor(page.desktop)}`}>
                      {page.desktop}
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge
                        variant={
                          page.status === 'good' ? 'success' :
                          page.status === 'needs improvement' ? 'warning' : 'danger'
                        }
                      >
                        {page.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
