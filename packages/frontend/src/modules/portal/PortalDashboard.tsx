import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard, Badge } from '@erp/ui';
import { Clock, Calendar, DollarSign, GraduationCap } from 'lucide-react';
import {
  usePortalOverview,
  useClockEntries,
  useShiftSchedule,
  useCompanyAnnouncements,
} from '../../data-layer/hooks/usePortal';
import type { ClockEntry, CompanyAnnouncement } from '@erp/shared';

export default function PortalDashboard() {
  const { data: overview } = usePortalOverview();
  const { data: clockData } = useClockEntries();
  const { data: scheduleData } = useShiftSchedule();
  const { data: announcementsData } = useCompanyAnnouncements();
  const [clockedIn, setClockedIn] = useState(true);

  const kpis = useMemo(() => overview, [overview]);
  const todayShift = useMemo(() => scheduleData?.[0], [scheduleData]);
  const activeEntry = useMemo(
    () => clockData?.find((e: ClockEntry) => e.status === 'active'),
    [clockData]
  );
  const recentAnnouncements = useMemo(
    () => announcementsData?.slice(0, 3) ?? [],
    [announcementsData]
  );

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    high: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  if (!kpis) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">My Dashboard</h1>
        <p className="text-xs text-text-muted">Welcome back, James</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={kpis.hoursThisWeek.label}
          value={kpis.hoursThisWeek.formattedValue}
          trend={kpis.hoursThisWeek.trend}
          trendValue={`${kpis.hoursThisWeek.changePercent}%`}
          trendIsPositive={kpis.hoursThisWeek.trendIsPositive}
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          label={kpis.leaveBalance.label}
          value={kpis.leaveBalance.formattedValue}
          trend={kpis.leaveBalance.trend}
          trendValue={`${kpis.leaveBalance.changePercent}%`}
          trendIsPositive={kpis.leaveBalance.trendIsPositive}
          icon={<Calendar className="h-5 w-5" />}
        />
        <KPICard
          label={kpis.nextPaycheck.label}
          value={kpis.nextPaycheck.formattedValue}
          trend={kpis.nextPaycheck.trend}
          trendValue={`${kpis.nextPaycheck.changePercent}%`}
          trendIsPositive={kpis.nextPaycheck.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={kpis.pendingTrainings.label}
          value={kpis.pendingTrainings.formattedValue}
          trend={kpis.pendingTrainings.trend}
          trendValue={`${kpis.pendingTrainings.changePercent}%`}
          trendIsPositive={kpis.pendingTrainings.trendIsPositive}
          icon={<GraduationCap className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todayShift ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Shift</span>
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {todayShift.shiftType} Shift
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Time</span>
                  <span className="text-sm font-medium text-text-primary">
                    {todayShift.startTime} - {todayShift.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Department</span>
                  <span className="text-sm font-medium text-text-primary">
                    {todayShift.department}
                  </span>
                </div>
                {todayShift.workCenter && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Work Center</span>
                    <span className="text-sm font-medium text-text-primary">
                      {todayShift.workCenter}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No shift scheduled today</p>
            )}
          </CardContent>
        </Card>

        {/* Clock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Clock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-2">
              <p className="text-sm text-text-muted">
                {clockedIn
                  ? `Clocked in since ${activeEntry?.clockIn ? new Date(activeEntry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00 AM'}`
                  : 'Not currently clocked in'}
              </p>
              <button
                onClick={() => setClockedIn(!clockedIn)}
                className={`px-8 py-3 rounded-lg text-sm font-semibold text-white transition-colors ${
                  clockedIn
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {clockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnnouncements.map((ann: CompanyAnnouncement) => (
              <div
                key={ann.id}
                className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-surface-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ann.title}
                    </p>
                    {!ann.isRead && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {ann.author} &middot; {new Date(ann.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={priorityColors[ann.priority]}>
                  {ann.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
