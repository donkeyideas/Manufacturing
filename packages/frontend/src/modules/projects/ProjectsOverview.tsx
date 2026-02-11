import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard, Badge } from '@erp/ui';
import { getProjectsOverview, getProjects, getTasks } from '@erp/demo-data';
import { FolderKanban, Activity, DollarSign, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

export default function ProjectsOverview() {
  const { isDemo } = useAppMode();
  const overview = useMemo(() => isDemo ? getProjectsOverview() : null, [isDemo]);
  const projects = useMemo(() => isDemo ? getProjects() : [], [isDemo]);
  const tasks = useMemo(() => isDemo ? getTasks() : [], [isDemo]);

  const chartData = useMemo(
    () =>
      projects.map((p) => ({
        name: p.projectName.length > 20 ? p.projectName.substring(0, 20) + '...' : p.projectName,
        completionPercent: p.completionPercent,
      })),
    [projects]
  );

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
      todo: 'default',
      in_progress: 'info',
      in_review: 'warning',
      done: 'success',
    };
    const labels: Record<string, string> = {
      todo: 'Todo',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      critical: 'danger',
    };
    return <Badge variant={variants[priority] || 'default'}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  if (!overview) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Projects Overview</h1>
        <p className="text-xs text-text-muted">Track project progress, tasks, and team performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalProjects.label}
          value={overview.totalProjects.formattedValue}
          trend={overview.totalProjects.trend}
          trendValue={`${overview.totalProjects.changePercent}%`}
          trendIsPositive={overview.totalProjects.trendIsPositive}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <KPICard
          label={overview.activeProjects.label}
          value={overview.activeProjects.formattedValue}
          trend={overview.activeProjects.trend}
          trendValue={`${overview.activeProjects.changePercent}%`}
          trendIsPositive={overview.activeProjects.trendIsPositive}
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          label={overview.totalBudget.label}
          value={overview.totalBudget.formattedValue}
          trend={overview.totalBudget.trend}
          trendValue={`${overview.totalBudget.changePercent}%`}
          trendIsPositive={overview.totalBudget.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview.completionRate.label}
          value={overview.completionRate.formattedValue}
          trend={overview.completionRate.trend}
          trendValue={`${overview.completionRate.changePercent}%`}
          trendIsPositive={overview.completionRate.trendIsPositive}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Project Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                fontSize={12}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
              />
              <Bar dataKey="completionPercent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-text-muted">{task.taskNumber}</p>
                    <span className="text-xs text-text-muted">•</span>
                    <p className="text-xs text-text-muted">{task.assigneeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
