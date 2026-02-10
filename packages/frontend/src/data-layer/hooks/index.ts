// Auth
export { useAuth } from './useAuth';

// Financial
export {
  useFinancialOverview,
  useChartOfAccounts,
  useJournalEntries,
  useCreateJournalEntry,
  usePostJournalEntry,
} from './useFinancial';

// Inventory
export {
  useInventoryOverview,
  useItems,
  useWarehouses,
  useCreateItem,
} from './useInventory';

// Sales
export {
  useSalesOverview,
  useCustomers,
  useSalesOrders,
  useCreateSalesOrder,
} from './useSales';

// Manufacturing
export {
  useManufacturingOverview,
  useWorkOrders,
  useBOMs,
  useCreateWorkOrder,
  useUpdateWorkOrderStatus,
} from './useManufacturing';

// Procurement
export {
  useProcurementOverview,
  useVendors,
  usePurchaseOrders,
  useCreatePurchaseOrder,
} from './useProcurement';

// HR & Payroll
export {
  useHROverview,
  useEmployees,
  usePayrollPeriods,
  usePayrollRuns,
  useLeaveRequests,
  useTimeEntries,
} from './useHRPayroll';

// Projects
export {
  useProjectsOverview,
  useProjects,
  useTasks,
  useSprints,
} from './useProjects';

// Assets
export {
  useAssetsOverview,
  useFixedAssets,
  useDepreciationSchedule,
  useMaintenanceRecords,
} from './useAssets';

// Reports
export {
  useReportsOverview,
  useReportDefinitions,
  useScheduledReports,
  useReportHistory,
  useAnalyticsDashboard,
} from './useReports';

// AI
export {
  useAIOverview,
  useChatHistory,
  useDocumentQueue,
  useAIInsights,
} from './useAI';

// SOP
export {
  useSOPOverview,
  useSOPs,
  useSOP,
  useSOPAcknowledgments,
} from './useSOP';

// Employee Portal
export {
  usePortalOverview,
  useEmployeeProfile,
  useClockEntries,
  usePayStubs,
  useLeaveBalances,
  usePortalLeaveRequests,
  useEmployeeReviews,
  useShiftSchedule,
  useTrainingCertifications,
  useCompanyAnnouncements,
} from './usePortal';
