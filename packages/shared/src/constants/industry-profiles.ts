import type { IndustryProfile, IndustryType } from '../types/industry';

export const INDUSTRY_PROFILES: Record<IndustryType, IndustryProfile> = {
  'general-manufacturing': {
    id: 'general-manufacturing',
    label: 'General Manufacturing',
    description: 'General-purpose manufacturing operations',
    accentColor: '#3b82f6',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'activeOrders', label: 'Active Orders', icon: 'ShoppingCart', formatter: 'number' },
      { key: 'inventoryAlerts', label: 'Inventory Alerts', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'oee', label: 'OEE', icon: 'Gauge', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'sales', 'procurement', 'financial', 'hr-payroll', 'assets', 'projects', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Batch',
      unitLabel: 'Unit',
      qualityCheckLabel: 'QC Check',
      workOrderLabel: 'Work Order',
    },
    qualityMetrics: [
      { key: 'defect-rate', label: 'Defect Rate', description: 'Percentage of defective units produced' },
      { key: 'first-pass-yield', label: 'First Pass Yield', description: 'Percentage passing QC on first attempt' },
    ],
  },

  'automotive': {
    id: 'automotive',
    label: 'Automotive',
    description: 'Automotive parts and vehicle assembly manufacturing',
    accentColor: '#ef4444',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'ppmDefectRate', label: 'PPM Defect Rate', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'taktTime', label: 'Takt Time (sec)', icon: 'Timer', formatter: 'number', invertTrend: true },
      { key: 'oee', label: 'OEE', icon: 'Gauge', formatter: 'percent' },
      { key: 'onTimeDelivery', label: 'On-Time Delivery', icon: 'Truck', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'procurement', 'sales', 'financial', 'assets', 'hr-payroll', 'projects', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Lot',
      unitLabel: 'Assembly',
      qualityCheckLabel: 'PPAP',
      workOrderLabel: 'Production Order',
    },
    qualityMetrics: [
      { key: 'ppm', label: 'Parts Per Million (PPM)', description: 'Defective parts per million produced', target: '< 50 PPM' },
      { key: 'cpk', label: 'Process Capability (Cpk)', description: 'Statistical measure of process capability', target: '>= 1.33' },
      { key: 'first-time-quality', label: 'First Time Quality', description: 'Parts passing all QC without rework' },
    ],
    recommendedSOPs: ['iatf-16949', 'fmea-process', 'ppap-submission'],
  },

  'electronics': {
    id: 'electronics',
    label: 'Electronics',
    description: 'Electronic components and PCB assembly manufacturing',
    accentColor: '#8b5cf6',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'firstPassYield', label: 'First Pass Yield', icon: 'CheckCircle', formatter: 'percent' },
      { key: 'smtDefectRate', label: 'SMT Defect Rate', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'throughput', label: 'Throughput (units/hr)', icon: 'Zap', formatter: 'number' },
      { key: 'componentLeadTime', label: 'Avg Lead Time (days)', icon: 'Clock', formatter: 'number', invertTrend: true },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'procurement', 'sales', 'financial', 'projects', 'hr-payroll', 'assets', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Serial',
      unitLabel: 'Board',
      qualityCheckLabel: 'AOI/ICT',
      workOrderLabel: 'Work Order',
    },
    qualityMetrics: [
      { key: 'dpmo', label: 'DPMO', description: 'Defects per million opportunities' },
      { key: 'solder-defects', label: 'Solder Defect Rate', description: 'Percentage of solder joints with defects' },
      { key: 'test-coverage', label: 'Test Coverage', description: 'Percentage of components with automated test' },
    ],
    recommendedSOPs: ['ipc-a-610', 'esd-handling', 'smt-process-control'],
  },

  'aerospace-defense': {
    id: 'aerospace-defense',
    label: 'Aerospace & Defense',
    description: 'Aerospace components and defense systems manufacturing',
    accentColor: '#1e3a5f',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'as9100Compliance', label: 'AS9100 Compliance', icon: 'Shield', formatter: 'percent' },
      { key: 'nonConformanceRate', label: 'NCR Rate', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'onTimeDelivery', label: 'On-Time Delivery', icon: 'Truck', formatter: 'percent' },
      { key: 'certStatus', label: 'Cert. Active', icon: 'Award', formatter: 'number' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'procurement', 'inventory', 'financial', 'projects', 'sales', 'assets', 'hr-payroll', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Lot',
      unitLabel: 'Component',
      qualityCheckLabel: 'AS9100 Audit',
      workOrderLabel: 'Work Order',
    },
    qualityMetrics: [
      { key: 'ncr-rate', label: 'Non-Conformance Rate', description: 'Non-conformance reports per production run' },
      { key: 'fai-completion', label: 'FAI Completion', description: 'First Article Inspection completion rate', target: '100%' },
      { key: 'traceability', label: 'Traceability Score', description: 'Percentage of parts with full traceability' },
    ],
    recommendedSOPs: ['as9100-compliance', 'first-article-inspection', 'special-process-control'],
  },

  'pharmaceuticals': {
    id: 'pharmaceuticals',
    label: 'Pharmaceuticals',
    description: 'Pharmaceutical and biotech drug manufacturing',
    accentColor: '#10b981',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'gmpCompliance', label: 'GMP Compliance', icon: 'Shield', formatter: 'percent' },
      { key: 'batchYield', label: 'Batch Yield', icon: 'FlaskConical', formatter: 'percent' },
      { key: 'deviationCount', label: 'Open Deviations', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'rightFirstTime', label: 'Right First Time', icon: 'CheckCircle', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'financial', 'procurement', 'hr-payroll', 'sales', 'assets', 'projects', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Batch',
      unitLabel: 'Batch',
      qualityCheckLabel: 'GMP Audit',
      workOrderLabel: 'Batch Record',
    },
    qualityMetrics: [
      { key: 'batch-failure', label: 'Batch Failure Rate', description: 'Percentage of batches that fail release criteria', target: '< 1%' },
      { key: 'deviation-closure', label: 'Deviation Closure Time', description: 'Average days to close a deviation', target: '< 30 days' },
      { key: 'oos-rate', label: 'OOS Rate', description: 'Out-of-specification results rate' },
    ],
    recommendedSOPs: ['gmp-compliance', 'batch-record-review', 'deviation-management', 'change-control'],
  },

  'food-beverage': {
    id: 'food-beverage',
    label: 'Food & Beverage',
    description: 'Food processing and beverage production',
    accentColor: '#f59e0b',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'haccpCompliance', label: 'HACCP Compliance', icon: 'Shield', formatter: 'percent' },
      { key: 'shelfLifeYield', label: 'Shelf Life Yield', icon: 'Package', formatter: 'percent' },
      { key: 'contaminationIncidents', label: 'Contamination Incidents', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'oee', label: 'OEE', icon: 'Gauge', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'procurement', 'sales', 'financial', 'hr-payroll', 'assets', 'projects', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Lot',
      unitLabel: 'Run',
      qualityCheckLabel: 'HACCP Check',
      workOrderLabel: 'Production Order',
    },
    qualityMetrics: [
      { key: 'pathogen-tests', label: 'Pathogen Test Pass Rate', description: 'Percentage of pathogen tests passed', target: '100%' },
      { key: 'allergen-control', label: 'Allergen Control Score', description: 'Compliance with allergen control procedures' },
      { key: 'shelf-life', label: 'Shelf Life Achievement', description: 'Products meeting target shelf life' },
    ],
    recommendedSOPs: ['haccp-plan', 'sanitation-schedule', 'allergen-control', 'traceability-recall'],
  },

  'chemicals': {
    id: 'chemicals',
    label: 'Chemicals',
    description: 'Chemical processing and specialty chemicals manufacturing',
    accentColor: '#6366f1',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'yieldPercent', label: 'Yield %', icon: 'FlaskConical', formatter: 'percent' },
      { key: 'safetyIncidents', label: 'Safety Incidents', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'regulatoryCompliance', label: 'Reg. Compliance', icon: 'Shield', formatter: 'percent' },
      { key: 'reactorUptime', label: 'Reactor Uptime', icon: 'Gauge', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'inventory', 'procurement', 'financial', 'hr-payroll', 'sales', 'assets', 'projects', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Batch',
      unitLabel: 'Batch',
      qualityCheckLabel: 'SDS Audit',
      workOrderLabel: 'Process Order',
    },
    qualityMetrics: [
      { key: 'purity', label: 'Product Purity', description: 'Average purity of produced chemicals', target: '>= 99.5%' },
      { key: 'environmental', label: 'Environmental Compliance', description: 'Compliance with emission and waste limits' },
      { key: 'reaction-efficiency', label: 'Reaction Efficiency', description: 'Actual vs theoretical yield' },
    ],
    recommendedSOPs: ['chemical-handling', 'reactor-operations', 'waste-management', 'sds-management'],
  },

  'machinery-equipment': {
    id: 'machinery-equipment',
    label: 'Machinery & Equipment',
    description: 'Industrial machinery and heavy equipment manufacturing',
    accentColor: '#64748b',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'projectCompletion', label: 'Project Completion', icon: 'CheckCircle', formatter: 'percent' },
      { key: 'warrantyClaims', label: 'Warranty Claims', icon: 'AlertTriangle', formatter: 'number', invertTrend: true },
      { key: 'engineeringChanges', label: 'Open ECOs', icon: 'FileEdit', formatter: 'number', invertTrend: true },
      { key: 'onTimeDelivery', label: 'On-Time Delivery', icon: 'Truck', formatter: 'percent' },
    ],
    modulePriority: ['dashboard', 'manufacturing', 'projects', 'procurement', 'inventory', 'sales', 'financial', 'assets', 'hr-payroll', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Serial',
      unitLabel: 'Machine',
      qualityCheckLabel: 'FAT/SAT',
      workOrderLabel: 'Work Order',
    },
    qualityMetrics: [
      { key: 'warranty-rate', label: 'Warranty Claim Rate', description: 'Claims per unit shipped', target: '< 2%' },
      { key: 'engineering-accuracy', label: 'Engineering Accuracy', description: 'Designs requiring no revision' },
      { key: 'assembly-accuracy', label: 'Assembly Accuracy', description: 'Units assembled without rework' },
    ],
    recommendedSOPs: ['machine-assembly', 'factory-acceptance-test', 'commissioning-procedure'],
  },

  'textiles-apparel': {
    id: 'textiles-apparel',
    label: 'Textiles & Apparel',
    description: 'Textile processing and garment manufacturing',
    accentColor: '#ec4899',
    dashboardKPIs: [
      { key: 'revenue', label: 'Revenue', icon: 'DollarSign', formatter: 'currency' },
      { key: 'fabricYield', label: 'Fabric Yield', icon: 'Scissors', formatter: 'percent' },
      { key: 'orderFillRate', label: 'Order Fill Rate', icon: 'ShoppingCart', formatter: 'percent' },
      { key: 'avgLeadTime', label: 'Avg Lead Time (days)', icon: 'Clock', formatter: 'number', invertTrend: true },
      { key: 'defectRate', label: 'Defect Rate', icon: 'AlertTriangle', formatter: 'percent', invertTrend: true },
    ],
    modulePriority: ['dashboard', 'sales', 'manufacturing', 'inventory', 'procurement', 'financial', 'hr-payroll', 'projects', 'assets', 'reports', 'ai', 'sop', 'calendar', 'tickets', 'seo', 'settings'],
    terminology: {
      batchLabel: 'Cut',
      unitLabel: 'Piece',
      qualityCheckLabel: 'AQL Check',
      workOrderLabel: 'Production Order',
    },
    qualityMetrics: [
      { key: 'aql', label: 'AQL Pass Rate', description: 'Percentage passing acceptance quality level', target: '>= 97%' },
      { key: 'color-consistency', label: 'Color Consistency', description: 'Dye lot color consistency score' },
      { key: 'fabric-utilization', label: 'Fabric Utilization', description: 'Percentage of fabric used vs wasted' },
    ],
    recommendedSOPs: ['cutting-procedure', 'quality-inspection-aql', 'dyeing-process'],
  },
};

export const INDUSTRY_LIST = Object.values(INDUSTRY_PROFILES);

export function getIndustryProfile(type: IndustryType): IndustryProfile {
  return INDUSTRY_PROFILES[type] ?? INDUSTRY_PROFILES['general-manufacturing'];
}
