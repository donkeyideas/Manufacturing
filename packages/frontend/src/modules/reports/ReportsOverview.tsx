import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard, Badge } from '@erp/ui';
import { getReportsOverview, getReportDefinitions } from '@erp/demo-data';
import { FileText, Clock, BarChart3, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsOverview() {
  const overview = useMemo(() => getReportsOverview(), []);
  const definitions = useMemo(() => getReportDefinitions(), []);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Financial':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-blue-100 text-blue-800">Financial</span>;
      case 'Operations':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-emerald-100 text-emerald-800">Operations</span>;
      case 'HR':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-purple-100 text-purple-800">HR</span>;
      case 'Executive':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-orange-100 text-orange-800">Executive</span>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const getFormatBadge = (fmt: string) => {
    switch (fmt) {
      case 'pdf':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-red-100 text-red-800">PDF</span>;
      case 'excel':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-emerald-100 text-emerald-800">Excel</span>;
      case 'csv':
        return <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-gray-100 text-gray-800">CSV</span>;
      default:
        return <Badge>{fmt}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <p className="text-xs text-text-muted">View, create, and manage reports across all modules</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalReports.label}
          value={overview.totalReports.formattedValue}
          trend={overview.totalReports.trend}
          trendValue={`${overview.totalReports.changePercent}%`}
          trendIsPositive={overview.totalReports.trendIsPositive}
          icon={<FileText className="h-5 w-5" />}
        />
        <KPICard
          label={overview.scheduledReports.label}
          value={overview.scheduledReports.formattedValue}
          trend={overview.scheduledReports.trend}
          trendValue={`${overview.scheduledReports.changePercent}%`}
          trendIsPositive={overview.scheduledReports.trendIsPositive}
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          label={overview.reportsRunThisMonth.label}
          value={overview.reportsRunThisMonth.formattedValue}
          trend={overview.reportsRunThisMonth.trend}
          trendValue={`${overview.reportsRunThisMonth.changePercent}%`}
          trendIsPositive={overview.reportsRunThisMonth.trendIsPositive}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KPICard
          label={overview.averageRunTime.label}
          value={overview.averageRunTime.formattedValue}
          trend={overview.averageRunTime.trend}
          trendValue={`${overview.averageRunTime.changePercent}%`}
          trendIsPositive={overview.averageRunTime.trendIsPositive}
          icon={<Zap className="h-5 w-5" />}
        />
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {definitions.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-full bg-surface-1">
                    <FileText className="h-4 w-4 text-text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {report.reportName}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getCategoryBadge(report.category)}
                  {getFormatBadge(report.format)}
                  <span className="text-xs text-text-muted">
                    {format(new Date(report.lastRunAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
