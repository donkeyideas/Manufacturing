import { describe, it, expect } from 'vitest';
import {
  getFinancialOverview,
  getChartOfAccounts,
  getJournalEntries,
  getSalesOverview,
  getCustomers,
  getSalesOrders,
  getProcurementOverview,
  getVendors,
  getPurchaseOrders,
  getInventoryOverview,
  getItems,
  getWarehouses,
  getManufacturingOverview,
  getWorkOrders,
  getBillsOfMaterials,
  getHROverview,
  getEmployees,
  getPayrollRuns,
  getLeaveRequests,
  getAssetsOverview,
  getFixedAssets,
  getDepreciationSchedule,
  getMaintenanceRecords,
  getProjectsOverview,
  getProjects,
  getTasks,
  getSprints,
  getReportsOverview,
  getReportDefinitions,
  getScheduledReports,
  getReportHistory,
  getAIOverview,
  getChatHistory,
  getDocumentQueue,
  getAIInsightsList,
} from '../index';

/**
 * Helper to validate that a KPI object has the expected shape
 * matching the DashboardKPI interface.
 */
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

// ─── Financial ───────────────────────────────────────────

describe('Financial data', () => {
  it('getFinancialOverview() has expected KPI properties', () => {
    const overview = getFinancialOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalRevenue);
    expectValidKPI(overview.totalExpenses);
    expectValidKPI(overview.netIncome);
    expectValidKPI(overview.cashBalance);
  });

  it('getChartOfAccounts() returns array with length > 5', () => {
    const accounts = getChartOfAccounts();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(5);
  });

  it('getJournalEntries() returns array with length > 0', () => {
    const entries = getJournalEntries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });
});

// ─── Sales ───────────────────────────────────────────────

describe('Sales data', () => {
  it('getSalesOverview() has expected KPI keys', () => {
    const overview = getSalesOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalOrders);
    expectValidKPI(overview.totalRevenue);
    expectValidKPI(overview.avgOrderValue);
    expectValidKPI(overview.openQuotes);
  });

  it('getCustomers() returns array with length > 0', () => {
    const customers = getCustomers();
    expect(Array.isArray(customers)).toBe(true);
    expect(customers.length).toBeGreaterThan(0);
  });

  it('getSalesOrders() returns array with length > 0', () => {
    const orders = getSalesOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });
});

// ─── Procurement ─────────────────────────────────────────

describe('Procurement data', () => {
  it('getProcurementOverview() has expected KPI keys', () => {
    const overview = getProcurementOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.activePOs);
    expectValidKPI(overview.totalSpend);
    expectValidKPI(overview.pendingReceipts);
    expectValidKPI(overview.activeVendors);
  });

  it('getVendors() returns array', () => {
    const vendors = getVendors();
    expect(Array.isArray(vendors)).toBe(true);
  });

  it('getPurchaseOrders() returns array', () => {
    const orders = getPurchaseOrders();
    expect(Array.isArray(orders)).toBe(true);
  });
});

// ─── Inventory ───────────────────────────────────────────

describe('Inventory data', () => {
  it('getInventoryOverview() has expected KPI keys', () => {
    const overview = getInventoryOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalItems);
    expectValidKPI(overview.totalValue);
    expectValidKPI(overview.lowStockItems);
    expectValidKPI(overview.warehouseCount);
  });

  it('getItems() returns array', () => {
    const items = getItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('getWarehouses() returns array', () => {
    const warehouses = getWarehouses();
    expect(Array.isArray(warehouses)).toBe(true);
  });
});

// ─── Manufacturing ───────────────────────────────────────

describe('Manufacturing data', () => {
  it('getManufacturingOverview() has expected KPI keys', () => {
    const overview = getManufacturingOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.activeWorkOrders);
    expectValidKPI(overview.completionRate);
    expectValidKPI(overview.avgCycleTime);
    expectValidKPI(overview.oee);
  });

  it('getWorkOrders() returns array', () => {
    const orders = getWorkOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it('getBillsOfMaterials() returns array', () => {
    const boms = getBillsOfMaterials();
    expect(Array.isArray(boms)).toBe(true);
  });
});

// ─── HR & Payroll ────────────────────────────────────────

describe('HR & Payroll data', () => {
  it('getHROverview() has totalEmployees, activeEmployees, monthlyPayroll, pendingLeaveRequests', () => {
    const overview = getHROverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalEmployees);
    expectValidKPI(overview.activeEmployees);
    expectValidKPI(overview.monthlyPayroll);
    expectValidKPI(overview.pendingLeaveRequests);
  });

  it('getEmployees() returns array with length > 0', () => {
    const employees = getEmployees();
    expect(Array.isArray(employees)).toBe(true);
    expect(employees.length).toBeGreaterThan(0);
  });

  it('getPayrollRuns() returns array', () => {
    const runs = getPayrollRuns();
    expect(Array.isArray(runs)).toBe(true);
  });

  it('getLeaveRequests() returns array', () => {
    const requests = getLeaveRequests();
    expect(Array.isArray(requests)).toBe(true);
  });
});

// ─── Assets ──────────────────────────────────────────────

describe('Assets data', () => {
  it('getAssetsOverview() has totalAssets, totalAssetValue, monthlyDepreciation, maintenanceCost', () => {
    const overview = getAssetsOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalAssets);
    expectValidKPI(overview.totalAssetValue);
    expectValidKPI(overview.monthlyDepreciation);
    expectValidKPI(overview.maintenanceCost);
  });

  it('getFixedAssets() returns array', () => {
    const assets = getFixedAssets();
    expect(Array.isArray(assets)).toBe(true);
  });

  it('getDepreciationSchedule() returns array', () => {
    const schedule = getDepreciationSchedule();
    expect(Array.isArray(schedule)).toBe(true);
  });

  it('getMaintenanceRecords() returns array', () => {
    const records = getMaintenanceRecords();
    expect(Array.isArray(records)).toBe(true);
  });
});

// ─── Projects ────────────────────────────────────────────

describe('Projects data', () => {
  it('getProjectsOverview() has totalProjects, activeProjects, totalBudget, completionRate', () => {
    const overview = getProjectsOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalProjects);
    expectValidKPI(overview.activeProjects);
    expectValidKPI(overview.totalBudget);
    expectValidKPI(overview.completionRate);
  });

  it('getProjects() returns array', () => {
    const projects = getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });

  it('getTasks() returns array', () => {
    const tasks = getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('getSprints() returns array', () => {
    const sprints = getSprints();
    expect(Array.isArray(sprints)).toBe(true);
  });
});

// ─── Reports ─────────────────────────────────────────────

describe('Reports data', () => {
  it('getReportsOverview() has totalReports, scheduledReports, reportsRunThisMonth, averageRunTime', () => {
    const overview = getReportsOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.totalReports);
    expectValidKPI(overview.scheduledReports);
    expectValidKPI(overview.reportsRunThisMonth);
    expectValidKPI(overview.averageRunTime);
  });

  it('getReportDefinitions() returns array', () => {
    const defs = getReportDefinitions();
    expect(Array.isArray(defs)).toBe(true);
  });

  it('getScheduledReports() returns array', () => {
    const scheduled = getScheduledReports();
    expect(Array.isArray(scheduled)).toBe(true);
  });

  it('getReportHistory() returns array', () => {
    const history = getReportHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});

// ─── AI ──────────────────────────────────────────────────

describe('AI data', () => {
  it('getAIOverview() has queriesThisMonth, documentsProcessed, insightsGenerated, avgResponseTime', () => {
    const overview = getAIOverview();
    expect(overview).toBeDefined();
    expectValidKPI(overview.queriesThisMonth);
    expectValidKPI(overview.documentsProcessed);
    expectValidKPI(overview.insightsGenerated);
    expectValidKPI(overview.avgResponseTime);
  });

  it('getChatHistory() returns array', () => {
    const history = getChatHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('getDocumentQueue() returns array', () => {
    const queue = getDocumentQueue();
    expect(Array.isArray(queue)).toBe(true);
  });

  it('getAIInsightsList() returns array', () => {
    const insights = getAIInsightsList();
    expect(Array.isArray(insights)).toBe(true);
  });
});
