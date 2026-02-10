import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardSkeleton } from '../modules/dashboard/components/DashboardSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ─── Lazy-loaded module pages ───

const Dashboard = lazy(() => import('../modules/dashboard/DashboardPage'));

// Financial
const FinancialOverview = lazy(() => import('../modules/financial/FinancialOverview'));
const ChartOfAccounts = lazy(() => import('../modules/financial/ChartOfAccountsPage'));
const JournalEntries = lazy(() => import('../modules/financial/JournalEntriesPage'));
const GeneralLedger = lazy(() => import('../modules/financial/GeneralLedgerPage'));
const FinancialStatements = lazy(() => import('../modules/financial/FinancialStatementsPage'));
const FiscalPeriods = lazy(() => import('../modules/financial/FiscalPeriodsPage'));
const Currencies = lazy(() => import('../modules/financial/CurrenciesPage'));

// Sales
const SalesOverview = lazy(() => import('../modules/sales/SalesOverview'));
const Customers = lazy(() => import('../modules/sales/CustomersPage'));
const SalesOrders = lazy(() => import('../modules/sales/SalesOrdersPage'));
const Quotes = lazy(() => import('../modules/sales/QuotesPage'));
const Invoices = lazy(() => import('../modules/sales/InvoicesPage'));
const Shipments = lazy(() => import('../modules/sales/ShipmentsPage'));
const Opportunities = lazy(() => import('../modules/sales/OpportunitiesPage'));

// Procurement
const ProcurementOverview = lazy(() => import('../modules/procurement/ProcurementOverview'));
const Vendors = lazy(() => import('../modules/procurement/VendorsPage'));
const PurchaseOrders = lazy(() => import('../modules/procurement/PurchaseOrdersPage'));
const Requisitions = lazy(() => import('../modules/procurement/RequisitionsPage'));
const VendorInvoices = lazy(() => import('../modules/procurement/VendorInvoicesPage'));
const GoodsReceipts = lazy(() => import('../modules/procurement/GoodsReceiptsPage'));

// Inventory
const InventoryOverview = lazy(() => import('../modules/inventory/InventoryOverview'));
const Items = lazy(() => import('../modules/inventory/ItemsPage'));
const Warehouses = lazy(() => import('../modules/inventory/WarehousesPage'));
const Transactions = lazy(() => import('../modules/inventory/TransactionsPage'));
const CycleCounts = lazy(() => import('../modules/inventory/CycleCountsPage'));
const DemandPlanning = lazy(() => import('../modules/inventory/DemandPlanningPage'));

// Manufacturing
const ManufacturingOverview = lazy(() => import('../modules/manufacturing/ManufacturingOverview'));
const WorkOrders = lazy(() => import('../modules/manufacturing/WorkOrdersPage'));
const BOMs = lazy(() => import('../modules/manufacturing/BOMsPage'));
const Routings = lazy(() => import('../modules/manufacturing/RoutingsPage'));
const WorkCentersPage = lazy(() => import('../modules/manufacturing/WorkCentersPage'));
const ProductionTracking = lazy(() => import('../modules/manufacturing/ProductionTrackingPage'));
const QualityControl = lazy(() => import('../modules/manufacturing/QualityControlPage'));

// HR & Payroll
const HROverview = lazy(() => import('../modules/hr/HROverview'));
const Employees = lazy(() => import('../modules/hr/EmployeesPage'));
const PayrollRuns = lazy(() => import('../modules/hr/PayrollRunsPage'));
const LeaveRequests = lazy(() => import('../modules/hr/LeaveRequestsPage'));
const TimeClock = lazy(() => import('../modules/hr/TimeClockPage'));
const PayrollPeriods = lazy(() => import('../modules/hr/PayrollPeriodsPage'));

// Assets
const AssetsOverview = lazy(() => import('../modules/assets/AssetsOverview'));
const FixedAssets = lazy(() => import('../modules/assets/FixedAssetsPage'));
const Depreciation = lazy(() => import('../modules/assets/DepreciationPage'));
const Maintenance = lazy(() => import('../modules/assets/MaintenancePage'));

// Projects
const ProjectsOverview = lazy(() => import('../modules/projects/ProjectsOverview'));
const ProjectsList = lazy(() => import('../modules/projects/ProjectsListPage'));
const TaskBoard = lazy(() => import('../modules/projects/TaskBoardPage'));
const Sprints = lazy(() => import('../modules/projects/SprintsPage'));

// Reports
const ReportsOverview = lazy(() => import('../modules/reports/ReportsOverview'));
const Analytics = lazy(() => import('../modules/reports/AnalyticsPage'));
const ScheduledReports = lazy(() => import('../modules/reports/ScheduledReportsPage'));

// AI Assistant
const AIChat = lazy(() => import('../modules/ai/ChatPage'));
const DocumentIntelligence = lazy(() => import('../modules/ai/DocumentIntelligencePage'));
const AIInsights = lazy(() => import('../modules/ai/InsightsPage'));

// SEO & GEO
const SEOOverview = lazy(() => import('../modules/seo/SEOOverview'));
const KeywordTracking = lazy(() => import('../modules/seo/KeywordTrackingPage'));
const PagePerformance = lazy(() => import('../modules/seo/PagePerformancePage'));
const GEOInsights = lazy(() => import('../modules/seo/GEOInsightsPage'));
const CompetitorAnalysis = lazy(() => import('../modules/seo/CompetitorAnalysisPage'));
const SEOSettings = lazy(() => import('../modules/seo/SEOSettingsPage'));

// Calendar
const CalendarPage = lazy(() => import('../modules/calendar/CalendarPage'));

// Tickets
const TicketsOverview = lazy(() => import('../modules/tickets/TicketsOverview'));
const TicketList = lazy(() => import('../modules/tickets/TicketListPage'));
const SubmitTicket = lazy(() => import('../modules/tickets/SubmitTicketPage'));

// SOP
const SOPOverview = lazy(() => import('../modules/sop/SOPOverview'));
const SOPList = lazy(() => import('../modules/sop/SOPListPage'));
const SOPEditor = lazy(() => import('../modules/sop/SOPEditorPage'));
const SOPDetail = lazy(() => import('../modules/sop/SOPDetailPage'));
const SOPAcknowledgments = lazy(() => import('../modules/sop/AcknowledgmentsPage'));

// Settings
const GeneralSettings = lazy(() => import('../modules/settings/GeneralSettingsPage'));
const Integrations = lazy(() => import('../modules/settings/IntegrationsPage'));
const Security = lazy(() => import('../modules/settings/SecurityPage'));
const UsersRoles = lazy(() => import('../modules/settings/UsersRolesPage'));
const DataMigration = lazy(() => import('../modules/settings/DataMigrationPage'));

// ─── Loading fallback ───

function PageLoader() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
      <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg border border-border bg-surface-1 animate-skeleton" />
        ))}
      </div>
      <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton mt-4" />
    </div>
  );
}

function Lazy({ children, module }: { children: React.ReactNode; module?: string }) {
  return (
    <ErrorBoundary moduleName={module}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="dashboard"
        element={
          <ErrorBoundary moduleName="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route path="" element={<Navigate to="dashboard" replace />} />

      {/* Financial */}
      <Route path="financial" element={<Lazy module="Financial"><FinancialOverview /></Lazy>} />
      <Route path="financial/chart-of-accounts" element={<Lazy module="Financial"><ChartOfAccounts /></Lazy>} />
      <Route path="financial/journal-entries" element={<Lazy module="Financial"><JournalEntries /></Lazy>} />
      <Route path="financial/general-ledger" element={<Lazy module="Financial"><GeneralLedger /></Lazy>} />
      <Route path="financial/statements" element={<Lazy module="Financial"><FinancialStatements /></Lazy>} />
      <Route path="financial/fiscal-periods" element={<Lazy module="Financial"><FiscalPeriods /></Lazy>} />
      <Route path="financial/currencies" element={<Lazy module="Financial"><Currencies /></Lazy>} />

      {/* Sales */}
      <Route path="sales" element={<Lazy module="Sales"><SalesOverview /></Lazy>} />
      <Route path="sales/customers" element={<Lazy module="Sales"><Customers /></Lazy>} />
      <Route path="sales/orders" element={<Lazy module="Sales"><SalesOrders /></Lazy>} />
      <Route path="sales/quotes" element={<Lazy module="Sales"><Quotes /></Lazy>} />
      <Route path="sales/invoices" element={<Lazy module="Sales"><Invoices /></Lazy>} />
      <Route path="sales/shipments" element={<Lazy module="Sales"><Shipments /></Lazy>} />
      <Route path="sales/opportunities" element={<Lazy module="Sales"><Opportunities /></Lazy>} />

      {/* Procurement */}
      <Route path="procurement" element={<Lazy module="Procurement"><ProcurementOverview /></Lazy>} />
      <Route path="procurement/vendors" element={<Lazy module="Procurement"><Vendors /></Lazy>} />
      <Route path="procurement/orders" element={<Lazy module="Procurement"><PurchaseOrders /></Lazy>} />
      <Route path="procurement/requisitions" element={<Lazy module="Procurement"><Requisitions /></Lazy>} />
      <Route path="procurement/invoices" element={<Lazy module="Procurement"><VendorInvoices /></Lazy>} />
      <Route path="procurement/receipts" element={<Lazy module="Procurement"><GoodsReceipts /></Lazy>} />

      {/* Inventory */}
      <Route path="inventory" element={<Lazy module="Inventory"><InventoryOverview /></Lazy>} />
      <Route path="inventory/items" element={<Lazy module="Inventory"><Items /></Lazy>} />
      <Route path="inventory/warehouses" element={<Lazy module="Inventory"><Warehouses /></Lazy>} />
      <Route path="inventory/transactions" element={<Lazy module="Inventory"><Transactions /></Lazy>} />
      <Route path="inventory/cycle-counts" element={<Lazy module="Inventory"><CycleCounts /></Lazy>} />
      <Route path="inventory/demand-planning" element={<Lazy module="Inventory"><DemandPlanning /></Lazy>} />

      {/* Manufacturing */}
      <Route path="manufacturing" element={<Lazy module="Manufacturing"><ManufacturingOverview /></Lazy>} />
      <Route path="manufacturing/work-orders" element={<Lazy module="Manufacturing"><WorkOrders /></Lazy>} />
      <Route path="manufacturing/boms" element={<Lazy module="Manufacturing"><BOMs /></Lazy>} />
      <Route path="manufacturing/routings" element={<Lazy module="Manufacturing"><Routings /></Lazy>} />
      <Route path="manufacturing/work-centers" element={<Lazy module="Manufacturing"><WorkCentersPage /></Lazy>} />
      <Route path="manufacturing/tracking" element={<Lazy module="Manufacturing"><ProductionTracking /></Lazy>} />
      <Route path="manufacturing/quality" element={<Lazy module="Manufacturing"><QualityControl /></Lazy>} />

      {/* HR & Payroll */}
      <Route path="hr" element={<Lazy module="HR & Payroll"><HROverview /></Lazy>} />
      <Route path="hr/employees" element={<Lazy module="HR & Payroll"><Employees /></Lazy>} />
      <Route path="hr/time-clock" element={<Lazy module="HR & Payroll"><TimeClock /></Lazy>} />
      <Route path="hr/payroll-periods" element={<Lazy module="HR & Payroll"><PayrollPeriods /></Lazy>} />
      <Route path="hr/payroll-runs" element={<Lazy module="HR & Payroll"><PayrollRuns /></Lazy>} />
      <Route path="hr/leave" element={<Lazy module="HR & Payroll"><LeaveRequests /></Lazy>} />

      {/* Assets */}
      <Route path="assets" element={<Lazy module="Assets"><AssetsOverview /></Lazy>} />
      <Route path="assets/list" element={<Lazy module="Assets"><FixedAssets /></Lazy>} />
      <Route path="assets/depreciation" element={<Lazy module="Assets"><Depreciation /></Lazy>} />
      <Route path="assets/maintenance" element={<Lazy module="Assets"><Maintenance /></Lazy>} />

      {/* Projects */}
      <Route path="projects" element={<Lazy module="Projects"><ProjectsOverview /></Lazy>} />
      <Route path="projects/list" element={<Lazy module="Projects"><ProjectsList /></Lazy>} />
      <Route path="projects/boards" element={<Lazy module="Projects"><TaskBoard /></Lazy>} />
      <Route path="projects/sprints" element={<Lazy module="Projects"><Sprints /></Lazy>} />

      {/* Reports */}
      <Route path="reports" element={<Lazy module="Reports"><ReportsOverview /></Lazy>} />
      <Route path="reports/builder" element={<Lazy module="Reports"><ReportsOverview /></Lazy>} />
      <Route path="reports/analytics" element={<Lazy module="Reports"><Analytics /></Lazy>} />
      <Route path="reports/scheduled" element={<Lazy module="Reports"><ScheduledReports /></Lazy>} />

      {/* AI Assistant */}
      <Route path="ai" element={<Lazy module="AI Assistant"><AIChat /></Lazy>} />
      <Route path="ai/chat" element={<Lazy module="AI Assistant"><AIChat /></Lazy>} />
      <Route path="ai/documents" element={<Lazy module="AI Assistant"><DocumentIntelligence /></Lazy>} />
      <Route path="ai/insights" element={<Lazy module="AI Assistant"><AIInsights /></Lazy>} />

      {/* SEO & GEO */}
      <Route path="seo" element={<Lazy module="SEO & GEO"><SEOOverview /></Lazy>} />
      <Route path="seo/keywords" element={<Lazy module="SEO & GEO"><KeywordTracking /></Lazy>} />
      <Route path="seo/pages" element={<Lazy module="SEO & GEO"><PagePerformance /></Lazy>} />
      <Route path="seo/geo" element={<Lazy module="SEO & GEO"><GEOInsights /></Lazy>} />
      <Route path="seo/competitors" element={<Lazy module="SEO & GEO"><CompetitorAnalysis /></Lazy>} />
      <Route path="seo/settings" element={<Lazy module="SEO & GEO"><SEOSettings /></Lazy>} />

      {/* Calendar */}
      <Route path="calendar" element={<Lazy module="Calendar"><CalendarPage /></Lazy>} />

      {/* Tickets */}
      <Route path="tickets" element={<Lazy module="Tickets"><TicketsOverview /></Lazy>} />
      <Route path="tickets/list" element={<Lazy module="Tickets"><TicketList /></Lazy>} />
      <Route path="tickets/submit" element={<Lazy module="Tickets"><SubmitTicket /></Lazy>} />

      {/* SOPs */}
      <Route path="sop" element={<Lazy module="SOPs"><SOPOverview /></Lazy>} />
      <Route path="sop/list" element={<Lazy module="SOPs"><SOPList /></Lazy>} />
      <Route path="sop/new" element={<Lazy module="SOPs"><SOPEditor /></Lazy>} />
      <Route path="sop/acknowledgments" element={<Lazy module="SOPs"><SOPAcknowledgments /></Lazy>} />
      <Route path="sop/:id/edit" element={<Lazy module="SOPs"><SOPEditor /></Lazy>} />
      <Route path="sop/:id" element={<Lazy module="SOPs"><SOPDetail /></Lazy>} />

      {/* Settings */}
      <Route path="settings" element={<Lazy module="Settings"><GeneralSettings /></Lazy>} />
      <Route path="settings/general" element={<Lazy module="Settings"><GeneralSettings /></Lazy>} />
      <Route path="settings/integrations" element={<Lazy module="Settings"><Integrations /></Lazy>} />
      <Route path="settings/security" element={<Lazy module="Settings"><Security /></Lazy>} />
      <Route path="settings/users" element={<Lazy module="Settings"><UsersRoles /></Lazy>} />
      <Route path="settings/data-migration" element={<Lazy module="Settings"><DataMigration /></Lazy>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
