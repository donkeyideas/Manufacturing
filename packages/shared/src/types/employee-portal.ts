export interface EmployeeProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  managerId?: string;
  managerName?: string;
  hireDate: string;
  avatarUrl?: string;
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'temporary';
  workLocation?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ClockEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: 'active' | 'completed' | 'edited';
  workOrderId?: string;
  workOrderNumber?: string;
  notes?: string;
}

export interface PayStub {
  id: string;
  employeeId: string;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirementContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  ytdGross: number;
  ytdNet: number;
  ytdTaxes: number;
}

export interface LeaveBalance {
  type: string;
  accrued: number;
  used: number;
  pending: number;
  available: number;
}

export interface PortalLeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface EmployeeReview {
  id: string;
  reviewDate: string;
  reviewerName: string;
  period: string;
  type: 'annual' | 'quarterly' | 'probationary' | 'promotion';
  overallRating: number;
  categories: { name: string; rating: number; comments?: string }[];
  strengths: string[];
  improvements: string[];
  goals: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface ShiftSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: 'day' | 'evening' | 'night' | 'flexible';
  department: string;
  workCenter?: string;
  notes?: string;
}

export interface TrainingCertification {
  id: string;
  name: string;
  type: 'training' | 'certification';
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  completedDate?: string;
  expiryDate?: string;
  issuer?: string;
  score?: number;
  requiredForRole: boolean;
}

export interface CompanyAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  author: string;
  department?: string;
  publishedAt: string;
  expiresAt?: string;
  isRead: boolean;
}
