import type {
  IndustryType,
  IndustryDashboardSummary,
  PendingApproval,
  AIInsight,
  ModuleCard,
} from '@erp/shared';
import { getIndustryProfile, formatCurrency, formatPercent } from '@erp/shared';
import { calculateKPI } from '../calculations/kpi';

// ─── KPI Raw Data per Industry ───

const INDUSTRY_KPI_DATA: Record<IndustryType, Record<string, { current: number; previous: number }>> = {
  'general-manufacturing': {
    revenue: { current: 284750, previous: 261200 },
    activeOrders: { current: 47, previous: 42 },
    inventoryAlerts: { current: 8, previous: 12 },
    oee: { current: 87.3, previous: 84.1 },
  },
  'automotive': {
    revenue: { current: 1245000, previous: 1180000 },
    ppmDefectRate: { current: 42, previous: 58 },
    taktTime: { current: 47, previous: 52 },
    oee: { current: 89.1, previous: 86.5 },
    onTimeDelivery: { current: 96.8, previous: 94.2 },
  },
  'electronics': {
    revenue: { current: 892000, previous: 845000 },
    firstPassYield: { current: 96.2, previous: 94.8 },
    smtDefectRate: { current: 145, previous: 180 },
    throughput: { current: 1240, previous: 1180 },
    componentLeadTime: { current: 12, previous: 15 },
  },
  'aerospace-defense': {
    revenue: { current: 3450000, previous: 3280000 },
    as9100Compliance: { current: 99.2, previous: 98.7 },
    nonConformanceRate: { current: 3, previous: 5 },
    onTimeDelivery: { current: 94.5, previous: 92.8 },
    certStatus: { current: 12, previous: 11 },
  },
  'pharmaceuticals': {
    revenue: { current: 2180000, previous: 2050000 },
    gmpCompliance: { current: 99.8, previous: 99.5 },
    batchYield: { current: 97.2, previous: 96.1 },
    deviationCount: { current: 4, previous: 7 },
    rightFirstTime: { current: 94.5, previous: 92.8 },
  },
  'food-beverage': {
    revenue: { current: 567000, previous: 534000 },
    haccpCompliance: { current: 99.5, previous: 99.1 },
    shelfLifeYield: { current: 96.8, previous: 95.3 },
    contaminationIncidents: { current: 0, previous: 1 },
    oee: { current: 85.4, previous: 83.2 },
  },
  'chemicals': {
    revenue: { current: 1890000, previous: 1760000 },
    yieldPercent: { current: 94.7, previous: 93.2 },
    safetyIncidents: { current: 1, previous: 3 },
    regulatoryCompliance: { current: 98.9, previous: 97.8 },
    reactorUptime: { current: 91.3, previous: 88.7 },
  },
  'machinery-equipment': {
    revenue: { current: 4200000, previous: 3950000 },
    projectCompletion: { current: 87.5, previous: 82.3 },
    warrantyClaims: { current: 6, previous: 9 },
    engineeringChanges: { current: 11, previous: 15 },
    onTimeDelivery: { current: 91.2, previous: 88.5 },
  },
  'textiles-apparel': {
    revenue: { current: 345000, previous: 328000 },
    fabricYield: { current: 88.5, previous: 86.2 },
    orderFillRate: { current: 94.1, previous: 91.8 },
    avgLeadTime: { current: 18, previous: 22 },
    defectRate: { current: 2.8, previous: 3.5 },
  },
};

// ─── Formatter Lookup ───

const FORMATTER_MAP: Record<string, (v: number) => string> = {
  currency: (v: number) => formatCurrency(v),
  percent: (v: number) => formatPercent(v),
  number: (v: number) => v.toString(),
  compact: (v: number) => formatCurrency(v),
};

// ─── Industry Dashboard Summary ───

export function getIndustryDashboardSummary(industryType: IndustryType): IndustryDashboardSummary {
  const profile = getIndustryProfile(industryType);
  const data = INDUSTRY_KPI_DATA[industryType] ?? INDUSTRY_KPI_DATA['general-manufacturing'];
  const result: IndustryDashboardSummary = {};

  for (const kpiDef of profile.dashboardKPIs) {
    const vals = data[kpiDef.key];
    if (!vals) continue;
    const formatter = FORMATTER_MAP[kpiDef.formatter] ?? FORMATTER_MAP.number;
    result[kpiDef.key] = calculateKPI(
      kpiDef.label,
      vals.current,
      vals.previous,
      formatter,
      kpiDef.invertTrend,
    );
  }

  return result;
}

// ─── Industry AI Insights ───

const INDUSTRY_AI_INSIGHTS: Record<IndustryType, AIInsight[]> = {
  'general-manufacturing': [
    { id: 'gi1', type: 'warning', title: 'Low Stock Alert', description: 'Steel Rod (SR-1040) will run out in approximately 3 days based on current consumption rate.', severity: 'high', actionLabel: 'Create PO', actionLink: '/procurement/orders' },
    { id: 'gi2', type: 'suggestion', title: 'Vendor Consolidation', description: 'Combining orders for Vendor A and Vendor B could save ~$2,400/month in shipping costs.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/reports/analytics' },
    { id: 'gi3', type: 'anomaly', title: 'Unusual Scrap Rate', description: 'Work Center WC-03 showing 12% scrap rate this week vs. 3% average.', severity: 'high', actionLabel: 'View Details', actionLink: '/manufacturing/work-centers' },
    { id: 'gi4', type: 'prediction', title: 'Demand Forecast', description: 'Expect 25% increase in orders for Product Line B next month based on seasonal patterns.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/inventory/demand-planning' },
  ],
  'automotive': [
    { id: 'ai1', type: 'warning', title: 'PPAP Deadline Approaching', description: 'PPAP submission for Part #A-4520 due in 5 days. 2 of 18 elements still pending.', severity: 'high', actionLabel: 'View PPAP', actionLink: '/manufacturing/quality' },
    { id: 'ai2', type: 'anomaly', title: 'Takt Time Variance', description: 'Line 3 takt time increased 8% over last shift. Potential bottleneck at Station 7.', severity: 'high', actionLabel: 'View Line', actionLink: '/manufacturing/tracking' },
    { id: 'ai3', type: 'suggestion', title: 'Kanban Optimization', description: 'Reducing kanban lot size for Part B-200 from 500 to 350 could cut WIP by 15%.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/inventory/demand-planning' },
    { id: 'ai4', type: 'prediction', title: 'OEM Volume Change', description: 'Based on OEM forecasts, expect 12% volume increase for Q2 assembly orders.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/sales/orders' },
  ],
  'electronics': [
    { id: 'ei1', type: 'warning', title: 'Component Shortage Risk', description: 'MCU chip IC-3021 lead time extended to 16 weeks. Current stock covers 8 weeks.', severity: 'high', actionLabel: 'Source Alt', actionLink: '/procurement/vendors' },
    { id: 'ei2', type: 'anomaly', title: 'AOI Rejection Spike', description: 'PCB Line 2 AOI rejection rate jumped to 4.2% from 1.8% baseline. Check solder paste.', severity: 'high', actionLabel: 'View QC', actionLink: '/manufacturing/quality' },
    { id: 'ei3', type: 'suggestion', title: 'Reflow Profile Update', description: 'Updating reflow profile for new lead-free paste could improve yield by 0.8%.', severity: 'medium', actionLabel: 'View Details', actionLink: '/manufacturing/routings' },
    { id: 'ei4', type: 'prediction', title: 'Order Surge', description: 'IoT sensor board orders trending 30% above forecast for next 6 weeks.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/inventory/demand-planning' },
  ],
  'aerospace-defense': [
    { id: 'ad1', type: 'warning', title: 'AS9100 Audit Due', description: 'Surveillance audit scheduled in 21 days. 3 CAPA items still open.', severity: 'high', actionLabel: 'View CAPAs', actionLink: '/manufacturing/quality' },
    { id: 'ad2', type: 'anomaly', title: 'NCR Trend', description: 'Non-conformance reports up 40% on titanium machining processes this month.', severity: 'high', actionLabel: 'View NCRs', actionLink: '/manufacturing/quality' },
    { id: 'ad3', type: 'suggestion', title: 'Supplier Qualification', description: 'Adding a second source for Inconel 718 forgings could reduce lead time by 4 weeks.', severity: 'medium', actionLabel: 'View Vendors', actionLink: '/procurement/vendors' },
    { id: 'ad4', type: 'prediction', title: 'Contract Forecast', description: 'DoD budget increase likely to generate $2.1M in new orders by Q3.', severity: 'low', actionLabel: 'View Pipeline', actionLink: '/sales/opportunities' },
  ],
  'pharmaceuticals': [
    { id: 'ph1', type: 'warning', title: 'Deviation Overdue', description: 'Deviation DEV-2026-0089 closure overdue by 5 days. Impact assessment pending.', severity: 'high', actionLabel: 'View Deviation', actionLink: '/manufacturing/quality' },
    { id: 'ph2', type: 'anomaly', title: 'Batch Yield Drop', description: 'Batch BT-2026-0412 yield at 91.2% vs 97% target. Environmental controls check recommended.', severity: 'high', actionLabel: 'View Batch', actionLink: '/manufacturing/work-orders' },
    { id: 'ph3', type: 'suggestion', title: 'Process Optimization', description: 'Adjusting mixing parameters for Product X could improve batch consistency by 2%.', severity: 'medium', actionLabel: 'View Process', actionLink: '/manufacturing/routings' },
    { id: 'ph4', type: 'prediction', title: 'API Demand', description: 'Active ingredient demand projected to increase 18% next quarter from new market approvals.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/inventory/demand-planning' },
  ],
  'food-beverage': [
    { id: 'fb1', type: 'warning', title: 'Allergen Control Alert', description: 'Line changeover from peanut to tree-nut product requires full sanitation verification.', severity: 'high', actionLabel: 'View SOP', actionLink: '/sop/list' },
    { id: 'fb2', type: 'anomaly', title: 'Temperature Excursion', description: 'Cold storage unit #3 reached 42°F for 15 minutes. Product hold pending review.', severity: 'high', actionLabel: 'View Details', actionLink: '/inventory/warehouses' },
    { id: 'fb3', type: 'suggestion', title: 'Shelf Life Extension', description: 'Modified atmosphere packaging could extend Product Y shelf life by 40%.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/reports/analytics' },
    { id: 'fb4', type: 'prediction', title: 'Seasonal Demand', description: 'Holiday production should begin 2 weeks early based on last year\'s demand pattern.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/inventory/demand-planning' },
  ],
  'chemicals': [
    { id: 'ch1', type: 'warning', title: 'Safety Inspection Due', description: 'Reactor vessel R-4 annual inspection due in 10 days. Schedule maintenance window.', severity: 'high', actionLabel: 'Schedule', actionLink: '/assets/maintenance' },
    { id: 'ch2', type: 'anomaly', title: 'Yield Deviation', description: 'Batch CH-2026-0234 yield at 89.3% vs 94.7% target. Catalyst age may be factor.', severity: 'high', actionLabel: 'View Batch', actionLink: '/manufacturing/work-orders' },
    { id: 'ch3', type: 'suggestion', title: 'Energy Optimization', description: 'Shifting exothermic reactions to off-peak hours could save $8,400/month in energy.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/reports/analytics' },
    { id: 'ch4', type: 'prediction', title: 'Raw Material Pricing', description: 'Ethylene prices expected to rise 12% in Q2. Consider forward purchasing.', severity: 'low', actionLabel: 'View Vendors', actionLink: '/procurement/vendors' },
  ],
  'machinery-equipment': [
    { id: 'me1', type: 'warning', title: 'ECO Backlog Growing', description: '11 open engineering change orders, 4 past target completion date.', severity: 'high', actionLabel: 'View ECOs', actionLink: '/manufacturing/quality' },
    { id: 'me2', type: 'anomaly', title: 'Warranty Trend', description: 'Hydraulic system warranty claims up 30% this quarter. Root cause investigation needed.', severity: 'high', actionLabel: 'View Claims', actionLink: '/sales/orders' },
    { id: 'me3', type: 'suggestion', title: 'Design Standardization', description: 'Standardizing mounting brackets across 3 models could reduce part count by 25%.', severity: 'medium', actionLabel: 'View Details', actionLink: '/manufacturing/boms' },
    { id: 'me4', type: 'prediction', title: 'Service Revenue', description: 'Installed base growth projects 22% increase in aftermarket parts revenue by Q4.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/sales/opportunities' },
  ],
  'textiles-apparel': [
    { id: 'ta1', type: 'warning', title: 'Fabric Delivery Delayed', description: 'Supplier S-2043 fabric shipment delayed 7 days. 3 production orders affected.', severity: 'high', actionLabel: 'View POs', actionLink: '/procurement/orders' },
    { id: 'ta2', type: 'anomaly', title: 'Cut Waste Spike', description: 'Cutting room waste at 14.5% vs 11.5% target. Check marker efficiency and blade condition.', severity: 'high', actionLabel: 'View Details', actionLink: '/manufacturing/work-centers' },
    { id: 'ta3', type: 'suggestion', title: 'Marker Optimization', description: 'AI-optimized marker layouts could improve fabric utilization by 3.2%.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/ai/insights' },
    { id: 'ta4', type: 'prediction', title: 'Fast Fashion Cycle', description: 'Spring collection orders expected to peak 2 weeks earlier than last year.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/sales/orders' },
  ],
};

export function getIndustryAIInsights(industryType: IndustryType): AIInsight[] {
  return INDUSTRY_AI_INSIGHTS[industryType] ?? INDUSTRY_AI_INSIGHTS['general-manufacturing'];
}

// ─── Industry Pending Approvals ───

const INDUSTRY_PENDING_APPROVALS: Record<IndustryType, PendingApproval[]> = {
  'general-manufacturing': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0847 - Steel Rod Supply', requestedBy: 'Maria Garcia', amount: 12450.00, date: '2026-02-07', urgency: 'high' },
    { id: '2', type: 'vendor_invoice', title: 'INV-4521 - Precision Parts Co.', requestedBy: 'James Wilson', amount: 8320.50, date: '2026-02-06', urgency: 'medium' },
    { id: '3', type: 'leave_request', title: 'Vacation Request - Feb 15-19', requestedBy: 'Sarah Chen', date: '2026-02-05', urgency: 'low' },
    { id: '4', type: 'purchase_order', title: 'PO-2026-0851 - Electronic Components', requestedBy: 'Robert Kim', amount: 4780.00, date: '2026-02-04', urgency: 'medium' },
  ],
  'automotive': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-1201 - Stamping Die Set', requestedBy: 'Carlos Mendez', amount: 85000.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'PPAP Documentation - Tier 1 Submission', requestedBy: 'Lisa Park', amount: 3200.00, date: '2026-02-07', urgency: 'high' },
    { id: '3', type: 'purchase_order', title: 'PO-2026-1205 - Weld Wire Alloy', requestedBy: 'James Wilson', amount: 12800.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'leave_request', title: 'PTO Request - Line Supervisor', requestedBy: 'David Chen', date: '2026-02-05', urgency: 'low' },
  ],
  'electronics': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0933 - MCU Components (16-wk lead)', requestedBy: 'Wei Zhang', amount: 45600.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'vendor_invoice', title: 'INV-8842 - PCB Fabrication House', requestedBy: 'Amy Lin', amount: 23100.00, date: '2026-02-07', urgency: 'medium' },
    { id: '3', type: 'purchase_order', title: 'PO-2026-0937 - Solder Paste (Lead-Free)', requestedBy: 'Mike Johnson', amount: 5400.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'expense', title: 'IPC Training Certification', requestedBy: 'Sarah Kim', amount: 2800.00, date: '2026-02-05', urgency: 'low' },
  ],
  'aerospace-defense': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0456 - Inconel 718 Forgings', requestedBy: 'Col. James Reed', amount: 128500.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'Nadcap Audit Travel - Heat Treat', requestedBy: 'Patricia Moore', amount: 4500.00, date: '2026-02-07', urgency: 'high' },
    { id: '3', type: 'vendor_invoice', title: 'INV-7721 - Special Process Vendor', requestedBy: 'Tom Anderson', amount: 34200.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'purchase_order', title: 'PO-2026-0461 - Titanium Bar Stock', requestedBy: 'Karen White', amount: 67800.00, date: '2026-02-05', urgency: 'medium' },
  ],
  'pharmaceuticals': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0712 - API Raw Material', requestedBy: 'Dr. Elena Ruiz', amount: 245000.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'FDA Pre-Approval Inspection Prep', requestedBy: 'Mark Thompson', amount: 18500.00, date: '2026-02-07', urgency: 'high' },
    { id: '3', type: 'vendor_invoice', title: 'INV-5543 - Clean Room Validation', requestedBy: 'Jennifer Li', amount: 12400.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'leave_request', title: 'Comp Day - QA Director', requestedBy: 'Dr. Alan Foster', date: '2026-02-05', urgency: 'low' },
  ],
  'food-beverage': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0320 - Organic Ingredients', requestedBy: 'Maria Santos', amount: 34500.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'HACCP Recertification', requestedBy: 'Tom Parker', amount: 6200.00, date: '2026-02-07', urgency: 'high' },
    { id: '3', type: 'vendor_invoice', title: 'INV-2211 - Packaging Supplier', requestedBy: 'Lisa Brown', amount: 8900.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'purchase_order', title: 'PO-2026-0325 - Sanitizer Chemicals', requestedBy: 'Jake Williams', amount: 2100.00, date: '2026-02-05', urgency: 'low' },
  ],
  'chemicals': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0890 - Ethylene Glycol (Bulk)', requestedBy: 'Dr. Raj Patel', amount: 156000.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'EPA Emissions Monitoring Equipment', requestedBy: 'Karen Lee', amount: 28500.00, date: '2026-02-07', urgency: 'high' },
    { id: '3', type: 'vendor_invoice', title: 'INV-6673 - Catalyst Supplier', requestedBy: 'Mike Chen', amount: 42000.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'purchase_order', title: 'PO-2026-0895 - Lab Reagents', requestedBy: 'Sarah Johnson', amount: 4800.00, date: '2026-02-05', urgency: 'low' },
  ],
  'machinery-equipment': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0567 - CNC Spindle Assembly', requestedBy: 'Hans Mueller', amount: 45000.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'expense', title: 'Customer Site Commissioning Travel', requestedBy: 'Frank Reyes', amount: 8200.00, date: '2026-02-07', urgency: 'medium' },
    { id: '3', type: 'vendor_invoice', title: 'INV-3345 - Hydraulic Components', requestedBy: 'Dan Miller', amount: 22400.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'purchase_order', title: 'PO-2026-0571 - Electrical Panels', requestedBy: 'Kate O\'Brien', amount: 18700.00, date: '2026-02-05', urgency: 'low' },
  ],
  'textiles-apparel': [
    { id: '1', type: 'purchase_order', title: 'PO-2026-0234 - Cotton Fabric (Spring)', requestedBy: 'Isabella Rossi', amount: 67000.00, date: '2026-02-08', urgency: 'high' },
    { id: '2', type: 'vendor_invoice', title: 'INV-1190 - Dyehouse Services', requestedBy: 'Priya Sharma', amount: 15600.00, date: '2026-02-07', urgency: 'medium' },
    { id: '3', type: 'purchase_order', title: 'PO-2026-0238 - Trims & Buttons', requestedBy: 'Jin Lee', amount: 4200.00, date: '2026-02-06', urgency: 'medium' },
    { id: '4', type: 'leave_request', title: 'Leave Request - Pattern Maker', requestedBy: 'Claire Dubois', date: '2026-02-05', urgency: 'low' },
  ],
};

export function getIndustryPendingApprovals(industryType: IndustryType): PendingApproval[] {
  return INDUSTRY_PENDING_APPROVALS[industryType] ?? INDUSTRY_PENDING_APPROVALS['general-manufacturing'];
}

// ─── Industry Module Cards ───

const MODULE_CARD_DEFAULTS: Record<string, Pick<ModuleCard, 'name' | 'icon' | 'path' | 'color'>> = {
  financial: { name: 'Financial', icon: 'DollarSign', path: '/financial', color: '#3b82f6' },
  manufacturing: { name: 'Manufacturing', icon: 'Factory', path: '/manufacturing', color: '#8b5cf6' },
  sales: { name: 'Sales', icon: 'ShoppingCart', path: '/sales', color: '#10b981' },
  inventory: { name: 'Inventory', icon: 'Package', path: '/inventory', color: '#f59e0b' },
  procurement: { name: 'Procurement', icon: 'Truck', path: '/procurement', color: '#ef4444' },
  'hr-payroll': { name: 'HR & Payroll', icon: 'Users', path: '/hr', color: '#06b6d4' },
  assets: { name: 'Assets', icon: 'Building2', path: '/assets', color: '#64748b' },
  projects: { name: 'Projects', icon: 'FolderKanban', path: '/projects', color: '#a855f7' },
};

const MODULE_KPI_SNIPPETS: Record<string, Pick<ModuleCard, 'kpiLabel' | 'kpiValue' | 'kpiTrend'>> = {
  financial: { kpiLabel: 'Revenue MTD', kpiValue: '$284.7K', kpiTrend: 'up' },
  manufacturing: { kpiLabel: 'OEE', kpiValue: '87.3%', kpiTrend: 'up' },
  sales: { kpiLabel: 'Active Orders', kpiValue: '47', kpiTrend: 'up' },
  inventory: { kpiLabel: 'Stock Alerts', kpiValue: '8', kpiTrend: 'down' },
  procurement: { kpiLabel: 'Pending POs', kpiValue: '12', kpiTrend: 'flat' },
  'hr-payroll': { kpiLabel: 'Employees', kpiValue: '156', kpiTrend: 'up' },
  assets: { kpiLabel: 'Total Assets', kpiValue: '$1.2M', kpiTrend: 'up' },
  projects: { kpiLabel: 'Active', kpiValue: '5', kpiTrend: 'up' },
};

export function getIndustryModuleCards(industryType: IndustryType): ModuleCard[] {
  const profile = getIndustryProfile(industryType);
  // Take top 6 modules (skip 'dashboard') that have card defaults
  const topModules = profile.modulePriority
    .filter(id => id !== 'dashboard' && MODULE_CARD_DEFAULTS[id])
    .slice(0, 6);

  return topModules.map(id => ({
    id,
    ...MODULE_CARD_DEFAULTS[id],
    ...MODULE_KPI_SNIPPETS[id],
  })) as ModuleCard[];
}
