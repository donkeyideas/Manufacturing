import { useMemo } from 'react';
import {
  Globe, TrendingUp, FileText, Users,
  Search, Eye, Bot, BarChart3,
  ArrowUp, MessageSquare,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const TIP_STYLE = {
  backgroundColor: 'var(--surface-1)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
};

export function SEODashboard() {
  const trafficData = useMemo(() => [
    { month: 'Mar', visits: 8200, signups: 310 },
    { month: 'Apr', visits: 9100, signups: 365 },
    { month: 'May', visits: 9800, signups: 402 },
    { month: 'Jun', visits: 10500, signups: 438 },
    { month: 'Jul', visits: 11200, signups: 475 },
    { month: 'Aug', visits: 12100, signups: 520 },
    { month: 'Sep', visits: 13000, signups: 568 },
    { month: 'Oct', visits: 14200, signups: 612 },
    { month: 'Nov', visits: 15100, signups: 658 },
    { month: 'Dec', visits: 15800, signups: 710 },
    { month: 'Jan', visits: 17100, signups: 780 },
    { month: 'Feb', visits: 18420, signups: 847 },
  ], []);

  const landingPages = useMemo(() => [
    { page: '/features', traffic: 3240, signups: 162, conv: 5.0, bounce: 38 },
    { page: '/pricing', traffic: 2870, signups: 201, conv: 7.0, bounce: 32 },
    { page: '/blog/erp-comparison', traffic: 2450, signups: 98, conv: 4.0, bounce: 45 },
    { page: '/demo', traffic: 1980, signups: 158, conv: 8.0, bounce: 28 },
    { page: '/case-studies', traffic: 1640, signups: 66, conv: 4.0, bounce: 42 },
    { page: '/integrations', traffic: 1520, signups: 53, conv: 3.5, bounce: 48 },
    { page: '/industries/manufacturing', traffic: 1380, signups: 55, conv: 4.0, bounce: 40 },
    { page: '/free-trial', traffic: 1110, signups: 89, conv: 8.0, bounce: 25 },
  ], []);

  const keywords = useMemo(() => [
    { keyword: 'manufacturing ERP software', pos: 4, volume: 6600, difficulty: 78, traffic: 1420 },
    { keyword: 'best ERP for manufacturing', pos: 7, volume: 4400, difficulty: 72, traffic: 680 },
    { keyword: 'production management software', pos: 3, volume: 5200, difficulty: 65, traffic: 1860 },
    { keyword: 'factory management system', pos: 11, volume: 3100, difficulty: 58, traffic: 320 },
    { keyword: 'manufacturing inventory software', pos: 5, volume: 3800, difficulty: 70, traffic: 940 },
    { keyword: 'ERP implementation guide', pos: 8, volume: 2900, difficulty: 45, traffic: 480 },
    { keyword: 'cloud manufacturing ERP', pos: 6, volume: 4100, difficulty: 74, traffic: 820 },
    { keyword: 'small business manufacturing software', pos: 14, volume: 2600, difficulty: 52, traffic: 180 },
    { keyword: 'MRP software comparison', pos: 9, volume: 3400, difficulty: 60, traffic: 410 },
    { keyword: 'manufacturing automation platform', pos: 12, volume: 2200, difficulty: 68, traffic: 240 },
    { keyword: 'ERP vs MRP', pos: 2, volume: 7800, difficulty: 42, traffic: 3200 },
    { keyword: 'lean manufacturing software', pos: 10, volume: 3000, difficulty: 55, traffic: 360 },
  ], []);

  const topContent = useMemo(() => [
    { title: 'ERP vs MRP: Complete 2024 Guide', views: 8400, timeOnPage: '4:32', leads: 48, status: 'performing' as const },
    { title: '10 Signs You Need Manufacturing ERP', views: 6200, timeOnPage: '3:58', leads: 35, status: 'performing' as const },
    { title: 'Cloud ERP Migration Checklist', views: 4800, timeOnPage: '5:10', leads: 28, status: 'performing' as const },
    { title: 'Manufacturing KPIs Every Plant Manager Tracks', views: 3600, timeOnPage: '3:12', leads: 14, status: 'average' as const },
    { title: 'How to Calculate ERP ROI', views: 2900, timeOnPage: '2:45', leads: 8, status: 'average' as const },
    { title: 'Inventory Management Best Practices', views: 1800, timeOnPage: '1:58', leads: 3, status: 'underperforming' as const },
  ], []);

  const aiTrendData = useMemo(() => [
    { month: 'Sep', chatgpt: 38, googleAI: 72, perplexity: 18, bingCopilot: 22 },
    { month: 'Oct', chatgpt: 49, googleAI: 88, perplexity: 24, bingCopilot: 28 },
    { month: 'Nov', chatgpt: 58, googleAI: 105, perplexity: 30, bingCopilot: 34 },
    { month: 'Dec', chatgpt: 67, googleAI: 120, perplexity: 35, bingCopilot: 38 },
    { month: 'Jan', chatgpt: 76, googleAI: 140, perplexity: 41, bingCopilot: 44 },
    { month: 'Feb', chatgpt: 89, googleAI: 156, perplexity: 47, bingCopilot: 48 },
  ], []);

  const aiQueries = useMemo(() => [
    { query: 'what is the best manufacturing ERP?', engine: 'ChatGPT', position: 2, status: 'Recommended' as const },
    { query: 'ERP software for small manufacturers', engine: 'Google AI', position: 1, status: 'Featured' as const },
    { query: 'manufacturing software comparison 2024', engine: 'Perplexity', position: 3, status: 'Mentioned' as const },
    { query: 'how to choose manufacturing ERP', engine: 'ChatGPT', position: 1, status: 'Recommended' as const },
    { query: 'cloud ERP vs on-premise for manufacturing', engine: 'Google AI', position: 4, status: 'Mentioned' as const },
    { query: 'affordable manufacturing software', engine: 'Bing Copilot', position: 2, status: 'Recommended' as const },
    { query: 'ERP implementation best practices', engine: 'Perplexity', position: 5, status: 'Mentioned' as const },
    { query: 'production scheduling tools', engine: 'ChatGPT', position: 3, status: 'Mentioned' as const },
  ], []);

  const competitors = useMemo(() => [
    { name: 'Your Platform', score: 78, color: '#3b82f6' },
    { name: 'SAP', score: 85, color: '#64748b' },
    { name: 'Oracle', score: 82, color: '#64748b' },
    { name: 'Infor', score: 71, color: '#64748b' },
    { name: 'Epicor', score: 65, color: '#64748b' },
    { name: 'SYSPRO', score: 58, color: '#64748b' },
  ], []);

  const posBadge = (pos: number) => {
    const variant = pos <= 3 ? 'success' : pos <= 7 ? 'info' : pos <= 10 ? 'warning' : 'default';
    return <Badge variant={variant}>#{pos}</Badge>;
  };

  const statusBadge = (s: string) => {
    const v = s === 'Recommended' ? 'success' : s === 'Featured' ? 'info' : 'default';
    return <Badge variant={v}>{s}</Badge>;
  };

  const contentBadge = (s: string) => {
    const v = s === 'performing' ? 'success' : s === 'average' ? 'warning' : 'danger';
    return <Badge variant={v}>{s}</Badge>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">SEO & GEO Analytics</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform marketing site performance, content ROI, and AI visibility.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content & Keywords</TabsTrigger>
          <TabsTrigger value="ai">GEO & AI Visibility</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Overview ─── */}
        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Organic Traffic</p>
                </div>
                <p className="text-xl font-bold text-text-primary">18,420<span className="text-xs font-normal text-text-muted">/mo</span></p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+22.3%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Organic Signups</p>
                </div>
                <p className="text-xl font-bold text-text-primary">847<span className="text-xs font-normal text-text-muted">/mo</span></p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+15.8%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Conversion Rate</p>
                </div>
                <p className="text-xl font-bold text-text-primary">4.6%</p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+0.8%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Content ROI</p>
                </div>
                <p className="text-xl font-bold text-text-primary">{formatCurrency(12.40)}<span className="text-xs font-normal text-text-muted"> /article</span></p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+18.2%</p>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Organic Traffic & Conversions</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                      <Area yAxisId="left" type="monotone" dataKey="visits" name="Visits" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="signups" name="Signups" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Landing Pages</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="pb-2 font-medium">Page</th>
                        <th className="pb-2 font-medium text-right">Traffic</th>
                        <th className="pb-2 font-medium text-right">Signups</th>
                        <th className="pb-2 font-medium text-right">Conv. Rate</th>
                        <th className="pb-2 font-medium text-right">Bounce</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {landingPages.map((p) => (
                        <tr key={p.page} className="hover:bg-surface-2 transition-colors">
                          <td className="py-2 text-text-primary font-medium">{p.page}</td>
                          <td className="py-2 text-right text-text-secondary">{p.traffic.toLocaleString()}</td>
                          <td className="py-2 text-right text-text-secondary">{p.signups}</td>
                          <td className="py-2 text-right text-text-secondary">{p.conv}%</td>
                          <td className="py-2 text-right text-text-secondary">{p.bounce}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Content & Keywords ─── */}
        <TabsContent value="content">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><FileText className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Total Articles</p></div>
                <p className="text-xl font-bold text-text-primary">156</p>
                <p className="text-2xs text-text-muted">published</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><Eye className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Avg. Monthly Reads</p></div>
                <p className="text-xl font-bold text-text-primary">32,400</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><Users className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Leads from Content</p></div>
                <p className="text-xl font-bold text-text-primary">234<span className="text-xs font-normal text-text-muted">/mo</span></p>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Search className="h-4 w-4 text-text-muted" /><CardTitle>Keyword Rankings</CardTitle></div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="pb-2 font-medium">Keyword</th>
                        <th className="pb-2 font-medium">Position</th>
                        <th className="pb-2 font-medium text-right">Volume</th>
                        <th className="pb-2 font-medium">Difficulty</th>
                        <th className="pb-2 font-medium text-right">Est. Traffic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {keywords.map((k) => (
                        <tr key={k.keyword} className="hover:bg-surface-2 transition-colors">
                          <td className="py-2 text-text-primary font-medium">{k.keyword}</td>
                          <td className="py-2">{posBadge(k.pos)}</td>
                          <td className="py-2 text-right text-text-secondary">{k.volume.toLocaleString()}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-surface-2 overflow-hidden">
                                <div className={cn('h-full rounded-full', k.difficulty >= 70 ? 'bg-red-500' : k.difficulty >= 50 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${k.difficulty}%` }} />
                              </div>
                              <span className="text-text-muted">{k.difficulty}</span>
                            </div>
                          </td>
                          <td className="py-2 text-right text-text-secondary">{k.traffic.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Content Performance</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {topContent.map((c) => (
                  <div key={c.title} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-md p-2.5 hover:bg-surface-2 transition-colors">
                    <span className="text-xs font-medium text-text-primary flex-1 truncate">{c.title}</span>
                    <div className="flex items-center gap-4 text-2xs text-text-muted shrink-0">
                      <span>{c.views.toLocaleString()} views</span>
                      <span>{c.timeOnPage} avg</span>
                      <span>{c.leads} leads</span>
                      {contentBadge(c.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 3: GEO & AI Visibility ─── */}
        <TabsContent value="ai">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">ChatGPT Mentions</p></div>
                <p className="text-xl font-bold text-text-primary">89</p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+34%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><Search className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Google AI Overview</p></div>
                <p className="text-xl font-bold text-text-primary">156</p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+28%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><Globe className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Perplexity Citations</p></div>
                <p className="text-xl font-bold text-text-primary">47</p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+41%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1"><Bot className="h-3.5 w-3.5 text-text-muted" /><p className="text-2xs text-text-muted">Overall AI Score</p></div>
                <p className="text-xl font-bold text-text-primary">78<span className="text-xs font-normal text-text-muted"> / 100</span></p>
                <p className="text-2xs text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUp className="h-3 w-3" />+5 pts</p>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>AI Recommendation Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                      <Line type="monotone" dataKey="chatgpt" name="ChatGPT" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="googleAI" name="Google AI" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="perplexity" name="Perplexity" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="bingCopilot" name="Bing Copilot" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-text-muted" /><CardTitle>AI Query Analysis</CardTitle></div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="pb-2 font-medium">Query</th>
                        <th className="pb-2 font-medium">AI Engine</th>
                        <th className="pb-2 font-medium text-center">Position</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {aiQueries.map((q) => (
                        <tr key={q.query} className="hover:bg-surface-2 transition-colors">
                          <td className="py-2 text-text-primary font-medium">{q.query}</td>
                          <td className="py-2"><Badge variant="default">{q.engine}</Badge></td>
                          <td className="py-2 text-center text-text-secondary">#{q.position}</td>
                          <td className="py-2">{statusBadge(q.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-text-muted" /><CardTitle>Competitor AI Visibility</CardTitle></div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitors} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={90} />
                      <Tooltip contentStyle={TIP_STYLE} formatter={(value: number) => [`${value}/100`, 'AI Score']} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                        {competitors.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
