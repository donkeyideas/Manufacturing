import type { DashboardKPI } from '@erp/shared';
import { formatCurrency, formatCompact, formatPercent } from '@erp/shared';

export function calculateKPI(
  label: string,
  currentValue: number,
  previousValue: number,
  formatter: (v: number) => string = (v) => formatCompact(v),
  invertTrend = false
): DashboardKPI {
  const change = previousValue !== 0
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';
  const trendIsPositive = invertTrend ? trend === 'down' : trend === 'up';

  return {
    label,
    value: currentValue,
    formattedValue: formatter(currentValue),
    previousValue,
    changePercent: Math.round(change * 10) / 10,
    trend,
    trendIsPositive,
  };
}

export function calculateRevenueKPI(current: number, previous: number): DashboardKPI {
  return {
    ...calculateKPI('Revenue', current, previous, formatCurrency),
    sparklineData: generateSparkline(current, 14),
  };
}

export function calculateOrdersKPI(current: number, previous: number): DashboardKPI {
  return {
    ...calculateKPI('Active Orders', current, previous, (v) => v.toString()),
    sparklineData: generateSparkline(current, 14),
  };
}

export function calculateInventoryAlertsKPI(count: number, previousCount: number): DashboardKPI {
  return calculateKPI('Inventory Alerts', count, previousCount, (v) => v.toString(), true);
}

export function calculateOEEKPI(oee: number, previousOEE: number): DashboardKPI {
  return {
    ...calculateKPI('OEE', oee, previousOEE, (v) => formatPercent(v)),
    sparklineData: generateSparkline(oee, 14, 5),
  };
}

function generateSparkline(baseValue: number, points: number, variance = 15): number[] {
  const data: number[] = [];
  let current = baseValue * (1 - variance / 100);
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.45) * (baseValue * variance / 100 / points);
    current += change;
    data.push(Math.round(current * 100) / 100);
  }
  // Ensure last point is close to the actual value
  data[data.length - 1] = baseValue;
  return data;
}
