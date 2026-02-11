import { useState, useMemo } from 'react';
import {
  Globe, Link2, BarChart3, Bot, Bell, Search, Eye, Save,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const BTN_PRIMARY =
  'rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors';

const BTN_SECONDARY =
  'rounded-md border border-border bg-surface-0 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors';

interface AnalyticsService {
  name: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  defaultValue: string;
  connected: boolean;
}

export default function SEOSettingsPage() {
  const { isDemo } = useAppMode();

  /* --- Tab 1: Website & Domain state --- */
  const [websiteUrl, setWebsiteUrl] = useState(isDemo ? 'https://www.acmemfg.com' : '');
  const [companyName, setCompanyName] = useState(isDemo ? 'Acme Manufacturing Co.' : '');
  const [industry, setIndustry] = useState(isDemo ? 'Manufacturing' : '');
  const [keywords, setKeywords] = useState(
    isDemo ? 'CNC machining services, precision manufacturing, custom metal fabrication, industrial automation solutions, contract manufacturing' : ''
  );
  const [competitors, setCompetitors] = useState(
    isDemo
      ? ['https://www.precisionmfg.com', 'https://www.globalfabrication.com', 'https://www.elitemanufacturing.net']
      : ['', '', '']
  );

  /* --- Tab 2: Analytics Connections state --- */
  const services = useMemo<AnalyticsService[]>(
    () => [
      { name: 'Google Analytics 4', description: 'Track website traffic, user behavior, and conversion data', fieldLabel: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', defaultValue: isDemo ? 'G-XXXXXXXXXX' : '', connected: isDemo },
      { name: 'Google Search Console', description: 'Monitor search performance, indexing status, and crawl errors', fieldLabel: 'Property URL', placeholder: 'https://www.example.com', defaultValue: isDemo ? 'https://www.acmemfg.com' : '', connected: isDemo },
      { name: 'Bing Webmaster Tools', description: 'Track Bing search performance and submit sitemaps', fieldLabel: 'API Key', placeholder: 'Enter API key', defaultValue: '', connected: false },
      { name: 'SEMrush API', description: 'Competitive analysis, keyword research, and backlink data', fieldLabel: 'API Key', placeholder: 'Enter API key', defaultValue: '', connected: false },
      { name: 'Ahrefs API', description: 'Backlink analysis, keyword tracking, and site audit data', fieldLabel: 'API Key', placeholder: 'Enter API key', defaultValue: '', connected: false },
    ],
    [isDemo]
  );

  const [serviceValues, setServiceValues] = useState<Record<string, string>>(
    () => Object.fromEntries(services.map((s) => [s.name, s.defaultValue]))
  );

  /* --- Tab 3: AI & GEO Tracking state --- */
  const [aiMonitoring, setAiMonitoring] = useState(isDemo);
  const aiPlatforms = useMemo(
    () => ['ChatGPT', 'Google AI Overview', 'Perplexity', 'Bing Copilot', 'Claude'],
    []
  );
  const [checkedPlatforms, setCheckedPlatforms] = useState<Record<string, boolean>>(
    () => Object.fromEntries(aiPlatforms.map((p) => [p, isDemo]))
  );
  const [brandName, setBrandName] = useState(isDemo ? 'Acme Manufacturing' : '');
  const [brandAliases, setBrandAliases] = useState(isDemo ? 'Acme Mfg, ACME, Acme Manufacturing Co.' : '');
  const [monitorFrequency, setMonitorFrequency] = useState(isDemo ? 'Weekly' : 'Daily');
  const [alertThreshold, setAlertThreshold] = useState(isDemo ? '60' : '50');

  const industries = useMemo(
    () => ['Manufacturing', 'Automotive', 'Aerospace', 'Electronics', 'Food & Beverage'],
    []
  );

  const togglePlatform = (platform: string) =>
    setCheckedPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));

  const updateCompetitor = (index: number, value: string) =>
    setCompetitors((prev) => prev.map((c, i) => (i === index ? value : c)));

  const updateServiceValue = (name: string, value: string) =>
    setServiceValues((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">SEO Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Configure your website, analytics connections, and AI visibility tracking
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website & Domain</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Connections</TabsTrigger>
          <TabsTrigger value="ai">AI & GEO Tracking</TabsTrigger>
        </TabsList>

        {/* -------- Tab 1: Website & Domain -------- */}
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand-600" />
                Website & Domain Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Website URL</label>
                <input className={INPUT_CLS} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://www.example.com" />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Company Name</label>
                <input className={INPUT_CLS} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" />
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Industry</label>
                <select className={INPUT_CLS} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Primary Keywords */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Primary Keywords</label>
                <textarea className={cn(INPUT_CLS, 'min-h-[80px] resize-y')} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Enter keywords separated by commas" />
                <p className="text-2xs text-text-muted">Separate keywords with commas</p>
              </div>

              {/* Competitor Domains */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Competitor Domains</label>
                <div className="space-y-2">
                  {competitors.map((comp, idx) => (
                    <input key={idx} className={INPUT_CLS} value={comp} onChange={(e) => updateCompetitor(idx, e.target.value)} placeholder={`Competitor ${idx + 1} URL`} />
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="pt-2">
                <button className={BTN_PRIMARY}>
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Settings
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Tab 2: Analytics Connections -------- */}
        <TabsContent value="analytics">
          <div className="space-y-4">
            {services.map((svc) => (
              <div key={svc.name} className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {svc.name.includes('Google') ? (
                      <Search className="h-4 w-4 text-text-muted" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-text-muted" />
                    )}
                    <span className="text-sm font-semibold text-text-primary">{svc.name}</span>
                  </div>
                  <Badge variant={svc.connected ? 'success' : 'default'}>
                    {svc.connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>

                <p className="text-xs text-text-muted">{svc.description}</p>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">{svc.fieldLabel}</label>
                  <input
                    className={INPUT_CLS}
                    value={serviceValues[svc.name] ?? ''}
                    onChange={(e) => updateServiceValue(svc.name, e.target.value)}
                    placeholder={svc.placeholder}
                  />
                </div>

                <button className={svc.connected ? BTN_SECONDARY : BTN_PRIMARY}>
                  {svc.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* -------- Tab 3: AI & GEO Tracking -------- */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-brand-600" />
                AI & GEO Tracking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* AI Monitoring Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Enable AI Visibility Monitoring</p>
                  <p className="text-xs text-text-muted mt-0.5">Track how your brand appears in AI-generated answers</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiMonitoring}
                  onClick={() => setAiMonitoring(!aiMonitoring)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    aiMonitoring ? 'bg-brand-600' : 'bg-surface-3'
                  )}
                >
                  <span className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform',
                    aiMonitoring ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
              </div>

              {/* AI Platforms */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">AI Platforms to Track</label>
                <div className="flex flex-wrap gap-3">
                  {aiPlatforms.map((platform) => (
                    <label key={platform} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedPlatforms[platform] ?? false}
                        onChange={() => togglePlatform(platform)}
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-text-primary">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Brand Name</label>
                <input className={INPUT_CLS} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand name" />
              </div>

              {/* Brand Aliases */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Brand Aliases</label>
                <textarea className={cn(INPUT_CLS, 'min-h-[60px] resize-y')} value={brandAliases} onChange={(e) => setBrandAliases(e.target.value)} placeholder="Comma-separated aliases" />
                <p className="text-2xs text-text-muted">Comma-separated alternative names for your brand</p>
              </div>

              {/* Monitoring Frequency */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Monitoring Frequency</label>
                <select className={INPUT_CLS} value={monitorFrequency} onChange={(e) => setMonitorFrequency(e.target.value)}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {/* Alert Threshold */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-text-muted" />
                  Alert Threshold
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted whitespace-nowrap">Notify when AI visibility score drops below</span>
                  <input className={cn(INPUT_CLS, 'w-20 text-center')} type="number" min={0} max={100} value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} />
                </div>
              </div>

              {/* Save */}
              <div className="pt-2">
                <button className={BTN_PRIMARY}>
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Tracking Settings
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
