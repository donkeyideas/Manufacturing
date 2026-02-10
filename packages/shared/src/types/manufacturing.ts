import type { UUID, ISODate, ISOTimestamp, AuditFields } from './common';

// ─── Work Centers ───

export interface WorkCenter extends AuditFields {
  id: UUID;
  tenantId: UUID;
  workCenterCode: string;
  workCenterName: string;
  description?: string;
  location?: string;
  hourlyRate: number;
  efficiencyPercent: number;
  capacityHoursPerDay: number;
  setupTimeMinutes: number;
  isActive: boolean;
}

// ─── Bills of Materials ───

export type BOMType = 'standard' | 'phantom' | 'engineering' | 'manufacturing';

export interface BillOfMaterials extends AuditFields {
  id: UUID;
  tenantId: UUID;
  bomNumber: string;
  bomName: string;
  finishedItemId: UUID;
  finishedItemNumber?: string;
  finishedItemName?: string;
  bomType: BOMType;
  version: string;
  effectiveDate?: ISODate;
  expirationDate?: ISODate;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  lines: BOMLine[];
}

export interface BOMLine {
  id: UUID;
  bomId: UUID;
  componentItemId: UUID;
  componentItemNumber?: string;
  componentItemName?: string;
  lineNumber: number;
  quantityRequired: number;
  unitOfMeasure: string;
  scrapPercent?: number;
  yieldPercent: number;
  operationSequence?: number;
  isPhantom: boolean;
  notes?: string;
}

// ─── Routings ───

export interface Routing extends AuditFields {
  id: UUID;
  tenantId: UUID;
  routingNumber: string;
  routingName: string;
  finishedItemId: UUID;
  finishedItemNumber?: string;
  version: string;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  totalCycleTime: number;
  operations: RoutingOperation[];
}

export interface RoutingOperation {
  id: UUID;
  routingId: UUID;
  operationSequence: number;
  operationName: string;
  workCenterId: UUID;
  workCenterName?: string;
  setupTimeMinutes: number;
  runTimePerUnitMinutes: number;
  scrapPercent?: number;
  yieldPercent: number;
  isSubcontract: boolean;
  instructions?: string;
}

// ─── Work Orders ───

export type WorkOrderStatus = 'pending' | 'released' | 'in_progress' | 'completed' | 'closed' | 'cancelled';
export type WorkOrderType = 'standard' | 'rework' | 'repair' | 'maintenance';

export interface WorkOrder extends AuditFields {
  id: UUID;
  tenantId: UUID;
  workOrderNumber: string;
  workOrderType: WorkOrderType;
  finishedItemId: UUID;
  finishedItemNumber?: string;
  finishedItemName?: string;
  bomId?: UUID;
  routingId?: UUID;
  quantityOrdered: number;
  quantityCompleted: number;
  quantityScrapped: number;
  startDate: ISODate;
  dueDate: ISODate;
  actualStartDate?: ISOTimestamp;
  actualCompletionDate?: ISOTimestamp;
  status: WorkOrderStatus;
  priority: number;
  salesOrderId?: UUID;
  parentWorkOrderId?: UUID;
  warehouseId?: UUID;
  notes?: string;
  operations: WorkOrderOperation[];
  materials: WorkOrderMaterial[];
}

export interface WorkOrderOperation {
  id: UUID;
  workOrderId: UUID;
  operationSequence: number;
  operationName: string;
  workCenterId: UUID;
  workCenterName?: string;
  plannedSetupTime: number;
  plannedRunTime: number;
  actualSetupTime?: number;
  actualRunTime?: number;
  quantityPlanned: number;
  quantityCompleted: number;
  quantityScrapped: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface WorkOrderMaterial {
  id: UUID;
  workOrderId: UUID;
  componentItemId: UUID;
  componentItemNumber?: string;
  componentItemName?: string;
  quantityRequired: number;
  quantityIssued: number;
  quantityReturned: number;
  unitCost: number;
  totalCost: number;
  status: 'pending' | 'reserved' | 'issued' | 'short';
}

// ─── Quality Control ───

export type InspectionType = 'incoming' | 'in_process' | 'final' | 'random';
export type InspectionStatus = 'pending' | 'passed' | 'failed' | 'conditional';

export interface QualityInspection extends AuditFields {
  id: UUID;
  tenantId: UUID;
  inspectionNumber: string;
  workOrderId?: UUID;
  itemId: UUID;
  itemNumber?: string;
  inspectionType: InspectionType;
  quantityInspected: number;
  quantityAccepted: number;
  quantityRejected: number;
  rejectionReason?: string;
  inspectorId?: UUID;
  inspectionDate: ISODate;
  status: InspectionStatus;
  notes?: string;
}

// ─── Production Tracking ───

export interface ProductionReport {
  id: UUID;
  tenantId: UUID;
  reportDate: ISODate;
  workCenterId?: UUID;
  workOrderId?: UUID;
  totalHoursWorked: number;
  totalQuantityProduced: number;
  efficiencyPercent: number;
  downtimeHours: number;
}
