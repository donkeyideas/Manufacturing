import { useMemo } from 'react';
import { Globe, Search, Award, Target, MousePointer, Link, ArrowDownUp, FileCheck } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import {
  getSEOOverview,
  getOrganicTrafficTrend,
  getKeywordDistribution,
  getGEOInsights,
  getTopPages,
} from '@erp/demo-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface-1)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '12px',
};

const KPI_ICONS = [
  <Globe className="h-4 w-4" />,
  <Search className="h-4 w-4" />,
  <Award className="h-4 w-4" />,
  <Target className="h-4 w-4" />,
  <MousePointer className="h-4 w-4" />,
  <Link className="h-4 w-4" />,
  <ArrowDownUp className="h-4 w-4" />,
  <FileCheck className="h-4 w-4" />,
];

const DIST_COLORS: Record<string, string> = {
  '1-3': '#10b981',
  '4-10': '#3b82f6',
  '11-20': '#f59e0b',
  '21-50': '#f97316',
  '51-100': '#6b7280',
};

const CITATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function SEOOverview() {
  const overview = useMemo(() => getSEOOverview(), []);
  const traffic = useMemo(() => getOrganicTrafficTrend(), []);
  const distribution = useMemo(() => getKeywordDistribution(), []);
  const geo = useMemo(() => getGEOInsights(), []);
  const topPages = useMemo(() => getTopPages(), []);

  const kpiList = Object.values(overview);
  const aiScore = parseInt(geo.kpis.aiVisibilityScore.formattedValue) || 73;

  const citationData = geo.citationSources.map((s: any, i: number) => ({
    name: s.source,
    value: s.citations,
    fill: CITATION_COLORS[i % CITATION_COLORS.length],
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">SEO & GEO Analytics</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Monitor search visibility and AI engine optimization
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiList.map((kpi: any, i: number) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.formattedValue ?? kpi.value?.toString()}
            icon={KPI_ICONS[i]}
            trend={kpi.trend}
            trendValue={kpi.changePercent != null ? `${kpi.changePercent}%` : kpi.trendValue}
            trendIsPositive={kpi.trendIsPositive}
          />
        ))}
      </div>

      {/* Organic Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="gOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReferral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="organic" stackId="1" stroke="#3b82f6" fill="url(#gOrganic)" name="Organic" />
              <Area type="monotone" dataKey="paid" stackId="1" stroke="#f59e0b" fill="url(#gPaid)" name="Paid" />
              <Area type="monotone" dataKey="direct" stackId="1" stroke="#10b981" fill="url(#gDirect)" name="Direct" />
              <Area type="monotone" dataKey="referral" stackId="1" stroke="#8b5cf6" fill="url(#gReferral)" name="Referral" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column: Distribution + AI Visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Keyword Position Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis dataKey="range" type="category" stroke="var(--color-text-muted)" fontSize={12} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Keywords" radius={[0, 4, 4, 0]}>
                  {distribution.map((entry: any, i: number) => (
                    <Cell key={i} fill={DIST_COLORS[entry.range] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Visibility Score */}
        <Card>
          <CardHeader>
            <CardTitle>AI Visibility Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-border)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="58"
                  fill="none" stroke="#3b82f6" strokeWidth="10"
                  strokeDasharray={`${aiScore / 100 * 364} 364`}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <span className="absolute text-2xl font-bold text-text-primary">
                {aiScore}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={citationData} cx="50%" cy="50%" outerRadius={45} innerRadius={25} dataKey="value" paddingAngle={2}>
                  {citationData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">Page Title</th>
                  <th className="pb-2 pr-4 font-medium text-right">Traffic</th>
                  <th className="pb-2 pr-4 font-medium text-right">Impressions</th>
                  <th className="pb-2 pr-4 font-medium text-right">CTR%</th>
                  <th className="pb-2 font-medium text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {topPages.slice(0, 5).map((page: any, i: number) => (
                  <tr key={i} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 pr-4 text-text-primary font-medium">{page.title}</td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">{page.traffic?.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">{page.impressions?.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">{page.ctr}%</td>
                    <td className="py-2.5 text-right text-text-secondary">{page.avgPosition}</td>
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
