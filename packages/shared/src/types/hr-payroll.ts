import type { UUID, ISODate, ISOTimestamp, AuditFields, Address } from './common';

// ─── Employees ───

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'temporary';
export type EmploymentStatus = 'active' | 'on_leave' | 'terminated' | 'retired';
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface Employee extends AuditFields {
  id: UUID;
  tenantId: UUID;
  employeeNumber: string;
  userId?: UUID;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: ISODate;
  hireDate: ISODate;
  terminationDate?: ISODate;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  department?: string;
  jobTitle?: string;
  managerId?: UUID;
  managerName?: string;
  workLocation?: string;
  salary?: number;
  hourlyRate?: number;
  payFrequency: PayFrequency;
  address?: Address;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

// ─── Payroll ───

export interface PayrollPeriod extends AuditFields {
  id: UUID;
  tenantId: UUID;
  periodName: string;
  periodType: PayFrequency;
  startDate: ISODate;
  endDate: ISODate;
  payDate: ISODate;
  isClosed: boolean;
}

export interface TimeEntry extends AuditFields {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  employeeName?: string;
  entryDate: ISODate;
  clockInTime?: ISOTimestamp;
  clockOutTime?: ISOTimestamp;
  hoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  breakHours?: number;
  workOrderId?: UUID;
  taskDescription?: string;
  isApproved: boolean;
  approvedBy?: UUID;
}

export interface PayrollRecord extends AuditFields {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  employeeName?: string;
  payrollPeriodId: UUID;
  payDate: ISODate;
  grossPay: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  commissions: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirementContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  paymentMethod: 'direct_deposit' | 'check' | 'cash';
  isPosted: boolean;
}

// ─── Leave ───

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest extends AuditFields {
  id: UUID;
  tenantId: UUID;
  employeeId: UUID;
  employeeName?: string;
  requestNumber: string;
  leaveType: LeaveType;
  startDate: ISODate;
  endDate: ISODate;
  totalDays: number;
  status: LeaveStatus;
  approvedBy?: UUID;
  rejectionReason?: string;
  notes?: string;
}
