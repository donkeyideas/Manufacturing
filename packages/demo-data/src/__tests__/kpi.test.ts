import { describe, it, expect } from 'vitest';
import {
  calculateKPI,
  calculateRevenueKPI,
  calculateOrdersKPI,
  calculateInventoryAlertsKPI,
  calculateOEEKPI,
} from '../calculations/kpi';
import { formatCurrency, formatPercent } from '@erp/shared';

describe('calculateKPI', () => {
  it('returns correct formattedValue with default formatter', () => {
    const kpi = calculateKPI('Test', 1500, 1000);
    // Default formatter is formatCompact
    expect(kpi.formattedValue).toBeDefined();
    expect(typeof kpi.formattedValue).toBe('string');
    expect(kpi.formattedValue.length).toBeGreaterThan(0);
  });

  it('returns correct formattedValue with custom formatter (formatCurrency)', () => {
    const kpi = calculateKPI('Revenue', 2500, 2000, formatCurrency);
    expect(kpi.formattedValue).toContain('2,500');
    expect(kpi.formattedValue).toContain('$');
  });

  it('calculates positive change percent correctly', () => {
    const kpi = calculateKPI('Test', 120, 100);
    expect(kpi.changePercent).toBe(20);
  });

  it('calculates negative change percent correctly', () => {
    const kpi = calculateKPI('Test', 80, 100);
    expect(kpi.changePercent).toBe(-20);
  });

  it("returns 'up' trend when change > 0.5%", () => {
    const kpi = calculateKPI('Test', 101, 100);
    expect(kpi.trend).toBe('up');
  });

  it("returns 'down' trend when change < -0.5%", () => {
    const kpi = calculateKPI('Test', 99, 100);
    expect(kpi.trend).toBe('down');
  });

  it("returns 'flat' trend when change between -0.5% and 0.5%", () => {
    const kpi = calculateKPI('Test', 100.4, 100);
    expect(kpi.trend).toBe('flat');
  });

  it('trendIsPositive is true when trend is up and invertTrend is false', () => {
    const kpi = calculateKPI('Test', 120, 100, undefined, false);
    expect(kpi.trend).toBe('up');
    expect(kpi.trendIsPositive).toBe(true);
  });

  it('trendIsPositive is true when trend is down and invertTrend is true', () => {
    // For things like expenses, a downward trend is positive
    const kpi = calculateKPI('Expenses', 80, 100, undefined, true);
    expect(kpi.trend).toBe('down');
    expect(kpi.trendIsPositive).toBe(true);
  });

  it('handles zero previousValue without division by zero', () => {
    const kpi = calculateKPI('Test', 100, 0);
    expect(kpi.changePercent).toBe(0);
    expect(kpi.trend).toBe('flat');
    expect(Number.isFinite(kpi.changePercent)).toBe(true);
  });
});

describe('calculateRevenueKPI', () => {
  it("returns correct label 'Revenue'", () => {
    const kpi = calculateRevenueKPI(500000, 450000);
    expect(kpi.label).toBe('Revenue');
  });

  it('returns sparklineData array', () => {
    const kpi = calculateRevenueKPI(500000, 450000);
    expect(Array.isArray(kpi.sparklineData)).toBe(true);
    expect(kpi.sparklineData!.length).toBeGreaterThan(0);
  });

  it('uses formatCurrency formatter', () => {
    const kpi = calculateRevenueKPI(500000, 450000);
    expect(kpi.formattedValue).toContain('$');
  });
});

describe('calculateOrdersKPI', () => {
  it("returns correct label 'Active Orders'", () => {
    const kpi = calculateOrdersKPI(42, 38);
    expect(kpi.label).toBe('Active Orders');
  });

  it('returns sparklineData array', () => {
    const kpi = calculateOrdersKPI(42, 38);
    expect(Array.isArray(kpi.sparklineData)).toBe(true);
    expect(kpi.sparklineData!.length).toBeGreaterThan(0);
  });
});

describe('calculateInventoryAlertsKPI', () => {
  it("returns correct label 'Inventory Alerts'", () => {
    const kpi = calculateInventoryAlertsKPI(5, 8);
    expect(kpi.label).toBe('Inventory Alerts');
  });

  it('invertTrend is applied (down trend = positive)', () => {
    // count went from 8 to 5, which is a decrease - with invertTrend, this should be positive
    const kpi = calculateInventoryAlertsKPI(5, 8);
    expect(kpi.trend).toBe('down');
    expect(kpi.trendIsPositive).toBe(true);
  });
});

describe('calculateOEEKPI', () => {
  it("returns correct label 'OEE'", () => {
    const kpi = calculateOEEKPI(87.3, 84.1);
    expect(kpi.label).toBe('OEE');
  });

  it('uses formatPercent formatter', () => {
    const kpi = calculateOEEKPI(87.3, 84.1);
    expect(kpi.formattedValue).toContain('%');
  });
});
