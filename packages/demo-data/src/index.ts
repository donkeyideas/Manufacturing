// Dashboard data
export {
  getDashboardSummary,
  getRevenueChartData,
  getRevenueChartDataMultiRange,
  getOrdersChartData,
  getOrdersChartDataMultiRange,
  getProductionStatus,
  getPendingApprovals,
  getActivityFeed,
  getAIInsights,
  getNotifications,
  getModuleCards,
} from './data/dashboard';

// Admin dashboard data
export {
  getAdminDashboardSummary,
  getSubscriptionBreakdown,
  getMRRChartData,
  getDemoCodeStats,
  getRecentTenantActivity,
} from './data/admin-dashboard';

// Demo code management data
export { getDemoCodeList } from './data/demo-codes';

// Financial data
export {
  getFinancialOverview,
  getChartOfAccounts,
  getJournalEntries,
  getTrialBalance,
  getRecentTransactions,
  getFinancialStatements,
  getFiscalPeriods,
  getCurrencies,
} from './data/financial';

// Procurement data
export {
  getProcurementOverview,
  getVendors,
  getPurchaseOrders,
  getGoodsReceipts,
  getVendorInvoices,
  getRequisitions,
} from './data/procurement';

// Inventory data
export {
  getInventoryOverview,
  getItems,
  getWarehouses,
  getInventoryOnHand,
  getRecentInventoryTransactions,
  getCycleCounts,
  getDemandPlanningData,
} from './data/inventory';

// Calculations
export {
  calculateKPI,
  calculateRevenueKPI,
  calculateOrdersKPI,
  calculateInventoryAlertsKPI,
  calculateOEEKPI,
} from './calculations/kpi';

// Sales data
export {
  getSalesOverview,
  getCustomers,
  getSalesOrders,
  getSalesQuotes,
  getCustomerInvoices,
  getShipments,
  getOpportunities,
} from './data/sales';

// Manufacturing data
export {
  getManufacturingOverview,
  getWorkOrders,
  getBillsOfMaterials,
  getWorkCenters,
  getRoutings,
  getProductionTracking,
  getQualityRecords,
} from './data/manufacturing';

// HR & Payroll data
export {
  getHROverview,
  getEmployees,
  getPayrollPeriods,
  getPayrollRuns,
  getLeaveRequests,
  getTimeEntries,
} from './data/hr-payroll';

// Projects data
export {
  getProjectsOverview,
  getProjects,
  getTasks,
  getSprints,
} from './data/projects';

// Assets data
export {
  getAssetsOverview,
  getFixedAssets,
  getDepreciationSchedule,
  getMaintenanceRecords,
} from './data/assets';

// Reports data
export {
  getReportsOverview,
  getReportDefinitions,
  getScheduledReports,
  getReportHistory,
  getAnalyticsDashboard,
} from './data/reports';

// AI data
export {
  getAIOverview,
  getChatHistory,
  getDocumentQueue,
  getAIInsightsList,
} from './data/ai';

// SEO & GEO data
export {
  getSEOOverview,
  getOrganicTrafficTrend,
  getKeywordRankings,
  getKeywordDistribution,
  getTopPages,
  getGEOInsights,
  getCompetitorAnalysis,
  getPagePerformance,
  getContentOptimization,
} from './data/seo';

// Blog data
export {
  getBlogPosts,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogOverview,
} from './data/blog';

// Homepage data
export {
  getTestimonials,
  getPricingTiers,
  getFAQs,
  getHomepageStats,
} from './data/homepage';

// SOP data
export {
  getSOPs,
  getSOPById,
  getSOPAcknowledgments,
  getSOPsByDepartment,
  getSOPsByRole,
  getSOPOverview,
} from './data/sop';

// Industry-specific dashboard data
export {
  getIndustryDashboardSummary,
  getIndustryAIInsights,
  getIndustryPendingApprovals,
  getIndustryModuleCards,
} from './data/industry-dashboard';

// EDI / Document Exchange data
export {
  getEDIOverview,
  getEDITradingPartners,
  getEDITransactions,
  getEDIDocumentMaps,
  getEDISettings,
} from './data/edi';

// Employee Portal data
export {
  getEmployeeProfile,
  getClockEntries,
  getPayStubs,
  getLeaveBalances,
  getLeaveRequests as getPortalLeaveRequests,
  getEmployeeReviews,
  getShiftSchedule,
  getTrainingCertifications,
  getCompanyAnnouncements,
  getPortalOverview,
} from './data/employee-portal';
