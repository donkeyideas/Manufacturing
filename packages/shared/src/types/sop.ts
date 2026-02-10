export type SOPStatus = 'draft' | 'published' | 'archived' | 'under_review';

export interface SOP {
  id: string;
  sopNumber: string;
  title: string;
  description: string;
  content: string;
  category: string;
  department: string;
  roles: string[];
  version: string;
  status: SOPStatus;
  effectiveDate: string;
  reviewDate?: string;
  createdBy: string;
  approvedBy?: string;
  tags: string[];
  revisionHistory: SOPRevision[];
  createdAt: string;
  updatedAt: string;
}

export interface SOPRevision {
  version: string;
  changedBy: string;
  changedAt: string;
  changeDescription: string;
}

export interface SOPAcknowledgment {
  id: string;
  sopId: string;
  sopTitle: string;
  employeeId: string;
  employeeName: string;
  acknowledgedAt?: string;
  isAcknowledged: boolean;
  dueDate: string;
}
