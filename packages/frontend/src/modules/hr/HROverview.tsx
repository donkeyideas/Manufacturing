import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@erp/ui';
import { useHROverview, useLeaveRequests } from '../../data-layer/hooks/useHRPayroll';
import { Users, UserCheck, DollarSign, CalendarOff } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function HROverview() {
  const { data: overview } = useHROverview();
  const { data: leaveRequestsData } = useLeaveRequests();

  const hrOverview = useMemo(() => overview, [overview]);
  const leaveRequests = useMemo(() => leaveRequestsData ?? [], [leaveRequestsData]);

  const departmentData = useMemo(() => [
    { department: 'Engineering', headcount: 32 },
    { department: 'Operations', headcount: 28 },
    { department: 'Sales', headcount: 22 },
    { department: 'Finance', headcount: 18 },
    { department: 'HR', headcount: 12 },
    { department: 'IT', headcount: 16 },
  ], []);

  const recentLeaveRequests = useMemo(() => leaveRequests.slice(-5).reverse(), [leaveRequests]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  if (!hrOverview) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">HR & Payroll Overview</h1>
        <p className="text-xs text-text-muted">Manage your workforce and payroll operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={hrOverview.totalEmployees.label}
          value={hrOverview.totalEmployees.formattedValue}
          trend={hrOverview.totalEmployees.trend}
          trendValue={`${hrOverview.totalEmployees.changePercent}%`}
          trendIsPositive={hrOverview.totalEmployees.trendIsPositive}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          label={hrOverview.activeEmployees.label}
          value={hrOverview.activeEmployees.formattedValue}
          trend={hrOverview.activeEmployees.trend}
          trendValue={`${hrOverview.activeEmployees.changePercent}%`}
          trendIsPositive={hrOverview.activeEmployees.trendIsPositive}
          icon={<UserCheck className="h-5 w-5" />}
        />
        <KPICard
          label={hrOverview.monthlyPayroll.label}
          value={hrOverview.monthlyPayroll.formattedValue}
          trend={hrOverview.monthlyPayroll.trend}
          trendValue={`${hrOverview.monthlyPayroll.changePercent}%`}
          trendIsPositive={hrOverview.monthlyPayroll.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={hrOverview.pendingLeaveRequests.label}
          value={hrOverview.pendingLeaveRequests.formattedValue}
          trend={hrOverview.pendingLeaveRequests.trend}
          trendValue={`${hrOverview.pendingLeaveRequests.changePercent}%`}
          trendIsPositive={hrOverview.pendingLeaveRequests.trendIsPositive}
          icon={<CalendarOff className="h-5 w-5" />}
        />
      </div>

      {/* Headcount by Department Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Headcount by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="department"
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="headcount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLeaveRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {request.employeeName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-text-muted capitalize">{request.leaveType}</p>
                    <span className="text-xs text-text-muted">-</span>
                    <p className="text-xs text-text-muted">{request.totalDays} day{request.totalDays !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
