import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@erp/ui';
import { getCompetitorAnalysis } from '@erp/demo-data';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import {
  LineChart,
  Line,
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

const LINE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const OPP_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  high: 'success',
  medium: 'warning',
  low: 'default',
};

function formatTraffic(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function CompetitorAnalysisPage() {
  const { isDemo } = useAppMode();
  const data = useMemo(() => isDemo ? getCompetitorAnalysis() : null, [isDemo]);
  const competitors = data?.competitors ?? [];
  const sovTrend = data?.shareOfVoiceTrend ?? [];
  const gaps = data?.keywordGaps ?? [];

  const companyNames = competitors.map((c: any) => c.name);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Competitor Analysis</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Compare your SEO performance against competitors
        </p>
      </div>

      {/* Competitor Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">Company</th>
                  <th className="pb-2 pr-4 font-medium text-right">Domain Authority</th>
                  <th className="pb-2 pr-4 font-medium text-right">Organic Traffic</th>
                  <th className="pb-2 pr-4 font-medium text-right">Keywords</th>
                  <th className="pb-2 pr-4 font-medium text-right">Backlinks</th>
                  <th className="pb-2 pr-4 font-medium text-right">Share of Voice</th>
                  <th className="pb-2 font-medium text-right">AI Visibility</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c: any, i: number) => {
                  const isYou = c.name === 'Your Company';
                  return (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-border hover:bg-surface-2 transition-colors',
                        isYou && 'bg-blue-50 dark:bg-blue-950/20'
                      )}
                    >
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          {c.name}
                          {isYou && <Badge variant="info">You</Badge>}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">{c.domainAuthority}</td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">
                        {formatTraffic(c.organicTraffic)}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">
                        {c.keywords?.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">
                        {c.backlinks?.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-text-secondary">{c.shareOfVoice}%</td>
                      <td className="py-2.5 text-right text-text-secondary">{c.aiVisibility}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Share of Voice Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Share of Voice Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={sovTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              {companyNames.map((name: string, i: number) => {
                const isYou = name === 'Your Company';
                return (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={isYou ? 3 : 1.5}
                    dot={{ r: isYou ? 4 : 2 }}
                    name={name}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Keyword Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Gap Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 pr-4 font-medium">Keyword</th>
                  <th className="pb-2 pr-4 font-medium text-center">Competitor Rank</th>
                  <th className="pb-2 pr-4 font-medium">Competitor</th>
                  <th className="pb-2 pr-4 font-medium text-right">Search Volume</th>
                  <th className="pb-2 pr-4 font-medium text-center">Difficulty</th>
                  <th className="pb-2 font-medium text-center">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {gaps.slice(0, 10).map((g: any, i: number) => (
                  <tr key={i} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 pr-4 text-text-primary font-medium max-w-[200px] truncate">
                      {g.keyword}
                    </td>
                    <td className="py-2.5 pr-4 text-center text-text-secondary">{g.competitorRank}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{g.competitorDomain}</td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">
                      {g.searchVolume?.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-center text-text-secondary">{g.difficulty}</td>
                    <td className="py-2.5 text-center">
                      <Badge variant={OPP_VARIANT[g.opportunity] ?? 'default'}>
                        {g.opportunity}
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
