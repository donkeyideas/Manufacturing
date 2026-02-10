import { describe, it, expect } from 'vitest';
import {
  getIndustryDashboardSummary,
  getIndustryAIInsights,
  getIndustryPendingApprovals,
  getIndustryModuleCards,
} from '../index';
import { INDUSTRY_LIST } from '@erp/shared';

function expectValidKPI(kpi: unknown) {
  expect(kpi).toBeDefined();
  expect(kpi).not.toBeNull();
  const k = kpi as Record<string, unknown>;
  expect(typeof k.label).toBe('string');
  expect(k.label).toBeTruthy();
  expect(typeof k.value).toBe('number');
  expect(typeof k.formattedValue).toBe('string');
  expect(k.formattedValue).toBeTruthy();
  expect(['up', 'down', 'flat']).toContain(k.trend);
  expect(typeof k.trendIsPositive).toBe('boolean');
}

describe('Industry dashboard data', () => {
  INDUSTRY_LIST.forEach((profile) => {
    describe(profile.label, () => {
      it('returns correct number of KPIs', () => {
        const summary = getIndustryDashboardSummary(profile.id);
        expect(Object.keys(summary).length).toBe(profile.dashboardKPIs.length);
      });

      it('all KPIs have valid shape', () => {
        const summary = getIndustryDashboardSummary(profile.id);
        for (const kpi of Object.values(summary)) {
          expectValidKPI(kpi);
        }
      });

      it('returns AI insights array', () => {
        const insights = getIndustryAIInsights(profile.id);
        expect(Array.isArray(insights)).toBe(true);
        expect(insights.length).toBeGreaterThan(0);
        for (const insight of insights) {
          expect(typeof insight.title).toBe('string');
          expect(['warning', 'suggestion', 'anomaly', 'prediction']).toContain(insight.type);
        }
      });

      it('returns pending approvals array', () => {
        const approvals = getIndustryPendingApprovals(profile.id);
        expect(Array.isArray(approvals)).toBe(true);
        expect(approvals.length).toBeGreaterThan(0);
      });

      it('returns module cards array', () => {
        const cards = getIndustryModuleCards(profile.id);
        expect(Array.isArray(cards)).toBe(true);
        expect(cards.length).toBe(6);
        for (const card of cards) {
          expect(typeof card.name).toBe('string');
          expect(typeof card.path).toBe('string');
        }
      });
    });
  });
});
