import type {
  EmployeeProfile, ClockEntry, PayStub, LeaveBalance, PortalLeaveRequest,
  EmployeeReview, ShiftSchedule, TrainingCertification, CompanyAnnouncement,
} from '@erp/shared';
import { calculateKPI } from '../calculations/kpi';
import { formatCurrency } from '@erp/shared';

const employeeProfile: EmployeeProfile = {
  id: 'emp-1',
  employeeNumber: 'EMP-1001',
  firstName: 'James',
  lastName: 'Mitchell',
  email: 'james.mitchell@company.com',
  phone: '(555) 123-4567',
  department: 'Manufacturing',
  jobTitle: 'Senior CNC Operator',
  managerId: 'emp-10',
  managerName: 'David Chen',
  hireDate: '2021-03-15',
  employmentType: 'full_time',
  workLocation: 'Main Plant - Floor A',
  address: {
    line1: '1234 Oak Street',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'US',
  },
  emergencyContact: {
    name: 'Linda Mitchell',
    phone: '(555) 987-6543',
    relationship: 'Spouse',
  },
};

function generateClockEntries(): ClockEntry[] {
  const entries: ClockEntry[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDay();
    if (day === 0 || day === 6) continue; // skip weekends

    const hasOvertime = i % 5 === 0;
    const regular = 8;
    const overtime = hasOvertime ? 2 : 0;
    const total = regular + overtime;

    entries.push({
      id: `clock-${i}`,
      employeeId: 'emp-1',
      date: date.toISOString().split('T')[0],
      clockIn: `${date.toISOString().split('T')[0]}T06:00:00Z`,
      clockOut: i === 0 ? undefined : `${date.toISOString().split('T')[0]}T${14 + overtime}:30:00Z`,
      breakMinutes: 30,
      totalHours: i === 0 ? 0 : total,
      regularHours: i === 0 ? 0 : regular,
      overtimeHours: i === 0 ? 0 : overtime,
      status: i === 0 ? 'active' : 'completed',
      workOrderId: i % 3 === 0 ? 'wo-1' : i % 3 === 1 ? 'wo-2' : undefined,
      workOrderNumber: i % 3 === 0 ? 'WO-2025-0142' : i % 3 === 1 ? 'WO-2025-0143' : undefined,
    });
  }
  return entries;
}

const payStubs: PayStub[] = [
  {
    id: 'pay-1', employeeId: 'emp-1', periodName: 'Jan 1 - Jan 15, 2026', periodStart: '2026-01-01', periodEnd: '2026-01-15', payDate: '2026-01-20',
    regularHours: 80, overtimeHours: 4, regularPay: 2800, overtimePay: 210, bonuses: 0, grossPay: 3010,
    federalTax: 421.40, stateTax: 150.50, socialSecurity: 186.62, medicare: 43.65, healthInsurance: 125, retirementContribution: 180.60, otherDeductions: 0,
    totalDeductions: 1107.77, netPay: 1902.23, ytdGross: 3010, ytdNet: 1902.23, ytdTaxes: 802.17,
  },
  {
    id: 'pay-2', employeeId: 'emp-1', periodName: 'Jan 16 - Jan 31, 2026', periodStart: '2026-01-16', periodEnd: '2026-01-31', payDate: '2026-02-05',
    regularHours: 80, overtimeHours: 6, regularPay: 2800, overtimePay: 315, bonuses: 0, grossPay: 3115,
    federalTax: 436.10, stateTax: 155.75, socialSecurity: 193.13, medicare: 45.17, healthInsurance: 125, retirementContribution: 186.90, otherDeductions: 0,
    totalDeductions: 1142.05, netPay: 1972.95, ytdGross: 6125, ytdNet: 3875.18, ytdTaxes: 1632.32,
  },
  {
    id: 'pay-3', employeeId: 'emp-1', periodName: 'Dec 16 - Dec 31, 2025', periodStart: '2025-12-16', periodEnd: '2025-12-31', payDate: '2026-01-05',
    regularHours: 72, overtimeHours: 0, regularPay: 2520, overtimePay: 0, bonuses: 500, grossPay: 3020,
    federalTax: 422.80, stateTax: 151.00, socialSecurity: 187.24, medicare: 43.79, healthInsurance: 125, retirementContribution: 181.20, otherDeductions: 0,
    totalDeductions: 1111.03, netPay: 1908.97, ytdGross: 72480, ytdNet: 46185.20, ytdTaxes: 19384.80,
  },
  {
    id: 'pay-4', employeeId: 'emp-1', periodName: 'Dec 1 - Dec 15, 2025', periodStart: '2025-12-01', periodEnd: '2025-12-15', payDate: '2025-12-20',
    regularHours: 80, overtimeHours: 8, regularPay: 2800, overtimePay: 420, bonuses: 0, grossPay: 3220,
    federalTax: 450.80, stateTax: 161.00, socialSecurity: 199.64, medicare: 46.69, healthInsurance: 125, retirementContribution: 193.20, otherDeductions: 0,
    totalDeductions: 1176.33, netPay: 2043.67, ytdGross: 69460, ytdNet: 44276.23, ytdTaxes: 18532.97,
  },
  {
    id: 'pay-5', employeeId: 'emp-1', periodName: 'Nov 16 - Nov 30, 2025', periodStart: '2025-11-16', periodEnd: '2025-11-30', payDate: '2025-12-05',
    regularHours: 72, overtimeHours: 0, regularPay: 2520, overtimePay: 0, bonuses: 0, grossPay: 2520,
    federalTax: 352.80, stateTax: 126.00, socialSecurity: 156.24, medicare: 36.54, healthInsurance: 125, retirementContribution: 151.20, otherDeductions: 0,
    totalDeductions: 947.78, netPay: 1572.22, ytdGross: 66240, ytdNet: 42232.56, ytdTaxes: 17671.14,
  },
  {
    id: 'pay-6', employeeId: 'emp-1', periodName: 'Nov 1 - Nov 15, 2025', periodStart: '2025-11-01', periodEnd: '2025-11-15', payDate: '2025-11-20',
    regularHours: 80, overtimeHours: 2, regularPay: 2800, overtimePay: 105, bonuses: 0, grossPay: 2905,
    federalTax: 406.70, stateTax: 145.25, socialSecurity: 180.11, medicare: 42.12, healthInsurance: 125, retirementContribution: 174.30, otherDeductions: 0,
    totalDeductions: 1073.48, netPay: 1831.52, ytdGross: 63720, ytdNet: 40660.34, ytdTaxes: 17098.56,
  },
];

const leaveBalances: LeaveBalance[] = [
  { type: 'Vacation', accrued: 15, used: 3, pending: 2, available: 10 },
  { type: 'Sick Leave', accrued: 10, used: 2, pending: 0, available: 8 },
  { type: 'Personal', accrued: 3, used: 1, pending: 0, available: 2 },
];

const leaveRequests: PortalLeaveRequest[] = [
  { id: 'lr-1', type: 'Vacation', startDate: '2026-03-10', endDate: '2026-03-14', totalDays: 5, reason: 'Spring vacation with family', status: 'pending', submittedAt: '2026-02-01T10:00:00Z' },
  { id: 'lr-2', type: 'Vacation', startDate: '2025-12-23', endDate: '2025-12-27', totalDays: 3, reason: 'Holiday break', status: 'approved', submittedAt: '2025-11-15T08:00:00Z', reviewedBy: 'David Chen', reviewedAt: '2025-11-16T09:00:00Z' },
  { id: 'lr-3', type: 'Sick Leave', startDate: '2025-10-08', endDate: '2025-10-09', totalDays: 2, reason: 'Flu', status: 'approved', submittedAt: '2025-10-08T06:30:00Z', reviewedBy: 'David Chen', reviewedAt: '2025-10-08T07:00:00Z' },
  { id: 'lr-4', type: 'Personal', startDate: '2025-09-12', endDate: '2025-09-12', totalDays: 1, reason: 'Doctor appointment', status: 'approved', submittedAt: '2025-09-10T14:00:00Z', reviewedBy: 'David Chen', reviewedAt: '2025-09-10T15:00:00Z' },
];

const employeeReviews: EmployeeReview[] = [
  {
    id: 'rev-1',
    reviewDate: '2025-12-15',
    reviewerName: 'David Chen',
    period: '2025 Annual',
    type: 'annual',
    overallRating: 4.2,
    categories: [
      { name: 'Technical Skills', rating: 5, comments: 'Exceptional CNC operation skills. Can handle complex 5-axis programs independently.' },
      { name: 'Productivity', rating: 4, comments: 'Consistently meets production targets. Good efficiency with setup times.' },
      { name: 'Quality', rating: 4, comments: 'Very low scrap rate. Catches potential issues before they become defects.' },
      { name: 'Teamwork', rating: 4, comments: 'Great mentor to junior operators. Collaborative with quality team.' },
      { name: 'Safety', rating: 4, comments: 'Perfect safety record this year. Follows all procedures diligently.' },
      { name: 'Attendance', rating: 4, comments: 'Reliable attendance. Only missed 3 days (approved leave).' },
    ],
    strengths: ['Expert-level CNC programming', 'Strong mentoring abilities', 'Excellent quality awareness'],
    improvements: ['Could take more initiative on continuous improvement projects', 'Documentation of setup procedures could be more detailed'],
    goals: ['Complete advanced GD&T certification by Q2 2026', 'Lead one Kaizen event this year', 'Train 2 new operators on 5-axis machines'],
    status: 'completed',
  },
  {
    id: 'rev-2',
    reviewDate: '2025-06-15',
    reviewerName: 'David Chen',
    period: 'Q2 2025',
    type: 'quarterly',
    overallRating: 4.0,
    categories: [
      { name: 'Technical Skills', rating: 4.5 },
      { name: 'Productivity', rating: 4 },
      { name: 'Quality', rating: 4 },
      { name: 'Teamwork', rating: 3.5 },
    ],
    strengths: ['Reliable performer', 'Good problem-solving skills'],
    improvements: ['Communication with night shift could be improved'],
    goals: ['Improve setup time by 10%'],
    status: 'completed',
  },
];

function generateShiftSchedule(): ShiftSchedule[] {
  const shifts: ShiftSchedule[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    shifts.push({
      id: `shift-${i}`,
      date: date.toISOString().split('T')[0],
      startTime: '06:00',
      endTime: '14:30',
      shiftType: 'day',
      department: 'Manufacturing',
      workCenter: i % 3 === 0 ? 'CNC Mill Bay A' : 'CNC Lathe Bay B',
    });
  }
  return shifts;
}

const trainingCertifications: TrainingCertification[] = [
  { id: 'tc-1', name: 'CNC Operation Level 3', type: 'certification', status: 'completed', completedDate: '2024-05-15', expiryDate: '2026-05-15', issuer: 'NIMS', score: 92, requiredForRole: true },
  { id: 'tc-2', name: 'OSHA 10-Hour General Industry', type: 'certification', status: 'completed', completedDate: '2023-11-20', expiryDate: '2026-11-20', issuer: 'OSHA', requiredForRole: true },
  { id: 'tc-3', name: 'Lockout/Tagout Competent Person', type: 'training', status: 'completed', completedDate: '2025-06-05', issuer: 'Internal', requiredForRole: true },
  { id: 'tc-4', name: 'Advanced GD&T (ASME Y14.5)', type: 'training', status: 'in_progress', issuer: 'Tooling U-SME', requiredForRole: false },
  { id: 'tc-5', name: 'Forklift Operator', type: 'certification', status: 'expired', completedDate: '2023-08-10', expiryDate: '2025-08-10', issuer: 'Internal', requiredForRole: false },
  { id: 'tc-6', name: 'First Aid / CPR / AED', type: 'certification', status: 'completed', completedDate: '2025-03-01', expiryDate: '2027-03-01', issuer: 'American Red Cross', requiredForRole: false },
];

const companyAnnouncements: CompanyAnnouncement[] = [
  { id: 'ann-1', title: 'New Employee Portal Launched!', content: 'We are excited to announce the launch of the new employee portal. You can now manage your time, view pay stubs, request leave, and more — all in one place.', priority: 'high', author: 'HR Department', publishedAt: '2026-02-01T08:00:00Z', isRead: false },
  { id: 'ann-2', title: 'Q1 2026 Safety Stand-Down Week', content: 'Safety stand-down week is March 10-14. All departments will participate in focused safety training sessions. Check your schedule for your assigned session.', priority: 'urgent', author: 'Safety Committee', department: 'Manufacturing', publishedAt: '2026-02-05T10:00:00Z', isRead: false },
  { id: 'ann-3', title: 'Holiday Schedule Update', content: 'The plant will be closed on Presidents Day (Feb 17). This is a paid holiday for all full-time employees.', priority: 'normal', author: 'HR Department', publishedAt: '2026-01-28T09:00:00Z', isRead: true },
  { id: 'ann-4', title: 'Open Enrollment for 2026 Benefits', content: 'Open enrollment runs February 15-28. Review your current benefits and make any changes through the HR portal. Information sessions on Feb 12 and 13.', priority: 'high', author: 'HR Department', publishedAt: '2026-01-20T08:00:00Z', isRead: true },
  { id: 'ann-5', title: 'New CNC Equipment Arriving Next Month', content: 'Two new Haas VF-4SS machines will be installed in Bay C starting March 1st. Training sessions will be scheduled for all CNC operators.', priority: 'normal', author: 'Plant Manager', department: 'Manufacturing', publishedAt: '2026-01-15T14:00:00Z', isRead: true },
];

export function getEmployeeProfile() {
  return employeeProfile;
}

export function getClockEntries() {
  return generateClockEntries();
}

export function getPayStubs() {
  return payStubs;
}

export function getLeaveBalances() {
  return leaveBalances;
}

export function getLeaveRequests() {
  return leaveRequests;
}

export function getEmployeeReviews() {
  return employeeReviews;
}

export function getShiftSchedule() {
  return generateShiftSchedule();
}

export function getTrainingCertifications() {
  return trainingCertifications;
}

export function getCompanyAnnouncements() {
  return companyAnnouncements;
}

export function getPortalOverview() {
  const clockEntries = generateClockEntries();
  const thisWeekHours = clockEntries
    .filter((e) => e.status === 'completed')
    .slice(-5)
    .reduce((sum, e) => sum + e.totalHours, 0);

  return {
    hoursThisWeek: calculateKPI('Hours This Week', thisWeekHours, 40, (v) => `${v}h`),
    leaveBalance: calculateKPI('Leave Available', 10, 12, (v) => `${v} days`),
    nextPaycheck: calculateKPI('Next Paycheck', 1972.95, 1902.23, (v) => formatCurrency(v)),
    pendingTrainings: calculateKPI('Pending Training', 1, 2, (v) => v.toString(), true),
  };
}
