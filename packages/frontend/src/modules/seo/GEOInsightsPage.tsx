import { useMemo } from 'react';
import { Brain, Quote, Eye, ThumbsUp, Check, X } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { getGEOInsights } from '@erp/demo-data';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--surface-1)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
};

const CITATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const CATEGORY_COLORS: Record<string, string> = {
  high: '#10b981',
  medium: '#3b82f6',
  low: '#f59e0b',
};

const SOURCE_BADGE: Record<string, 'info' | 'success' | 'warning' | 'primary' | 'default'> = {
  ChatGPT: 'success',
  'Google AI Overview': 'info',
  Perplexity: 'warning',
  'Bing Copilot': 'primary',
  Claude: 'default',
};

const SENTIMENT_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  positive: 'success',
  neutral: 'default',
  negative: 'danger',
  mixed: 'warning',
};

export default function GEOInsightsPage() {
  const { isDemo } = useAppMode();
  const geo = useMemo(() => isDemo ? getGEOInsights() : null, [isDemo]);
  const kpis = geo?.kpis ?? {};
  const trend = geo?.aiVisibilityTrend ?? [];
  const citations = geo?.citationSources ?? [];
  const categories = geo?.queryCategories ?? [];
  const queries = geo?.topAIQueries ?? [];

  const citationData = citations.map((s: any, i: number) => ({
    ...s,
    fill: CITATION_COLORS[i % CITATION_COLORS.length],
  }));

  const categoryData = categories.map((c: any) => ({
    ...c,
    fill: CATEGORY_COLORS[c.visibility] ?? '#6b7280',
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">GEO Insights</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Track your visibility across AI-powered search engines
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={kpis.aiVisibilityScore?.label ?? 'AI Visibility Score'}
          value={kpis.aiVisibilityScore?.formattedValue ?? '73/100'}
          icon={<Brain className="h-4 w-4" />}
          trend={kpis.aiVisibilityScore?.trend ?? 'up'}
          trendValue={`${kpis.aiVisibilityScore?.changePercent ?? 8}%`}
          trendIsPositive={kpis.aiVisibilityScore?.trendIsPositive ?? true}
        />
        <KPICard
          label={kpis.aiCitations?.label ?? 'AI Citations'}
          value={kpis.aiCitations?.formattedValue ?? '342'}
          icon={<Quote className="h-4 w-4" />}
          trend={kpis.aiCitations?.trend ?? 'up'}
          trendValue={`${kpis.aiCitations?.changePercent ?? 24.5}%`}
          trendIsPositive={kpis.aiCitations?.trendIsPositive ?? true}
        />
        <KPICard
          label={kpis.aiSearchAppearances?.label ?? 'AI Search Appearances'}
          value={kpis.aiSearchAppearances?.formattedValue ?? '1,890'}
          icon={<Eye className="h-4 w-4" />}
          trend={kpis.aiSearchAppearances?.trend ?? 'up'}
          trendValue={`${kpis.aiSearchAppearances?.changePercent ?? 31.2}%`}
          trendIsPositive={kpis.aiSearchAppearances?.trendIsPositive ?? true}
        />
        <KPICard
          label={kpis.brandSentiment?.label ?? 'Brand Sentiment'}
          value={kpis.brandSentiment?.formattedValue ?? '87%'}
          icon={<ThumbsUp className="h-4 w-4" />}
          trend={kpis.brandSentiment?.trend ?? 'up'}
          trendValue={`${kpis.brandSentiment?.changePercent ?? 2.1}%`}
          trendIsPositive={kpis.brandSentiment?.trendIsPositive ?? true}
        />
      </div>

      {/* AI Visibility Trend */}
      <Card>
        <CardHeader>
          <CardTitle>AI Visibility Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gVisibility" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                fill="url(#gVisibility)"
                name="Visibility Score"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="citations"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Citations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column: Citations + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Citation Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Citation Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={citationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="citations"
                  nameKey="source"
                >
                  {citationData.map((entry: any, i: number) => (
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
          </CardContent>
        </Card>

        {/* Query Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Query Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={100}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="queries" name="Queries" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top AI Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top AI Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">Query</th>
                  <th className="pb-2 pr-4 font-medium text-center">Source</th>
                  <th className="pb-2 pr-4 font-medium text-center">Position</th>
                  <th className="pb-2 pr-4 font-medium text-center">Cited</th>
                  <th className="pb-2 font-medium text-center">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {queries.slice(0, 10).map((q: any, i: number) => (
                  <tr key={i} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 pr-4 text-text-primary font-medium max-w-[260px] truncate">
                      {q.query}
                    </td>
                    <td className="py-2.5 pr-4 text-center">
                      <Badge variant={SOURCE_BADGE[q.source] ?? 'default'}>{q.source}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-center text-text-secondary">{q.position}</td>
                    <td className="py-2.5 pr-4 text-center">
                      {q.cited ? (
                        <Check className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 inline" />
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge variant={SENTIMENT_VARIANT[q.sentiment] ?? 'default'}>
                        {q.sentiment}
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
