import type { UUID, ISODate, ISOTimestamp, AuditFields } from './common';

// ─── Projects ───

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project extends AuditFields {
  id: UUID;
  tenantId: UUID;
  projectNumber: string;
  projectName: string;
  description?: string;
  status: ProjectStatus;
  startDate?: ISODate;
  endDate?: ISODate;
  budget?: number;
  actualCost?: number;
  managerId?: UUID;
  managerName?: string;
  completionPercent: number;
  notes?: string;
}

// ─── Tasks ───

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task extends AuditFields {
  id: UUID;
  tenantId: UUID;
  projectId: UUID;
  taskNumber: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: UUID;
  assigneeName?: string;
  dueDate?: ISODate;
  estimatedHours?: number;
  actualHours?: number;
  sprintId?: UUID;
  parentTaskId?: UUID;
  labels: string[];
  order: number;
}

// ─── Sprints ───

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint extends AuditFields {
  id: UUID;
  tenantId: UUID;
  projectId: UUID;
  sprintName: string;
  sprintNumber: number;
  startDate: ISODate;
  endDate: ISODate;
  status: SprintStatus;
  goal?: string;
  totalPoints?: number;
  completedPoints?: number;
}
