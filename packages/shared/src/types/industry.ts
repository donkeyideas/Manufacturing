// ─── Industry Types & Profiles ───

export type IndustryType =
  | 'general-manufacturing'
  | 'automotive'
  | 'electronics'
  | 'aerospace-defense'
  | 'pharmaceuticals'
  | 'food-beverage'
  | 'chemicals'
  | 'machinery-equipment'
  | 'textiles-apparel';

export interface IndustryKPIDefinition {
  key: string;
  label: string;
  icon: string;
  formatter: 'currency' | 'percent' | 'number' | 'compact';
  invertTrend?: boolean;
}

export interface IndustryTerminology {
  batchLabel: string;
  unitLabel: string;
  qualityCheckLabel: string;
  workOrderLabel: string;
  custom?: Record<string, string>;
}

export interface IndustryQualityMetric {
  key: string;
  label: string;
  description: string;
  target?: string;
}

export interface IndustryProfile {
  id: IndustryType;
  label: string;
  description: string;
  accentColor: string;
  dashboardKPIs: IndustryKPIDefinition[];
  modulePriority: string[];
  modulesHidden?: string[];
  terminology: IndustryTerminology;
  qualityMetrics: IndustryQualityMetric[];
  recommendedSOPs?: string[];
}
