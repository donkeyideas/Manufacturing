import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { getTasks } from '@erp/demo-data';

export default function TaskBoardPage() {
  const tasks = useMemo(() => getTasks(), []);

  const columns = useMemo(
    () => [
      { key: 'todo', label: 'Todo' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'in_review', label: 'In Review' },
      { key: 'done', label: 'Done' },
    ],
    []
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      critical: 'danger',
    };
    return (
      <Badge variant={variants[priority] || 'default'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Task Board</h1>
        <p className="text-xs text-text-muted">Visualize and manage tasks across all projects</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.key] || [];
          return (
            <Card key={column.key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{column.label}</span>
                  <span className="text-xs font-normal text-text-muted bg-surface-2 rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border border-border bg-surface-0 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-text-primary">{task.title}</p>
                      <p className="text-xs text-text-muted mt-1">{task.assigneeName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.labels.map((label) => (
                            <span
                              key={label}
                              className="px-1.5 py-0.5 text-2xs font-medium rounded bg-surface-2 text-text-muted"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-text-muted text-center py-4">No tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
