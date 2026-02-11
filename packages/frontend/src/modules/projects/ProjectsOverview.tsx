import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard, Badge } from '@erp/ui';
import { useProjectsOverview, useProjects, useTasks } from '../../data-layer/hooks/useProjects';
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

export default function ProjectsOverview() {
  const { data: overview, isLoading: isLoadingOverview } = useProjectsOverview();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();

  const chartData = useMemo(
    () =>
      projects.map((p: any) => {
        const label = p.name || p.projectName || 'Unnamed';
        return {
          name: label.length > 20 ? label.substring(0, 20) + '...' : label,
          completionPercent: Number(p.completionPercent) || 0,
        };
      }),
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

  if (isLoadingOverview || !overview) {
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
          label={overview.totalProjects?.label ?? 'Total Projects'}
          value={overview.totalProjects?.formattedValue ?? String(overview.totalProjects ?? projects.length)}
          trend={overview.totalProjects?.trend}
          trendValue={overview.totalProjects?.changePercent ? `${overview.totalProjects.changePercent}%` : undefined}
          trendIsPositive={overview.totalProjects?.trendIsPositive}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <KPICard
          label={overview.activeProjects?.label ?? 'Active Projects'}
          value={overview.activeProjects?.formattedValue ?? String(overview.activeProjects ?? projects.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length)}
          trend={overview.activeProjects?.trend}
          trendValue={overview.activeProjects?.changePercent ? `${overview.activeProjects.changePercent}%` : undefined}
          trendIsPositive={overview.activeProjects?.trendIsPositive}
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          label={overview.totalBudget?.label ?? 'Total Budget'}
          value={overview.totalBudget?.formattedValue ?? `$${Number(overview.totalBudget ?? projects.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0)).toLocaleString()}`}
          trend={overview.totalBudget?.trend}
          trendValue={overview.totalBudget?.changePercent ? `${overview.totalBudget.changePercent}%` : undefined}
          trendIsPositive={overview.totalBudget?.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview.completionRate?.label ?? 'Completion Rate'}
          value={overview.completionRate?.formattedValue ?? `${projects.length ? Math.round(projects.reduce((sum: number, p: any) => sum + (Number(p.completionPercent) || 0), 0) / projects.length) : 0}%`}
          trend={overview.completionRate?.trend}
          trendValue={overview.completionRate?.changePercent ? `${overview.completionRate.changePercent}%` : undefined}
          trendIsPositive={overview.completionRate?.trendIsPositive}
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
            {recentTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{task.title || 'Untitled Task'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-text-muted">{task.taskNumber || task.id}</p>
                    <span className="text-xs text-text-muted">•</span>
                    <p className="text-xs text-text-muted">{task.assigneeName || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status || 'todo')}
                  {getPriorityBadge(task.priority || 'medium')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
