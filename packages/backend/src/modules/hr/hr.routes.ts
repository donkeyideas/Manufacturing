import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { employees } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { employeeImportSchema } from '@erp/shared';

export const hrRouter = Router();
hrRouter.use(requireAuth);

// ─── Employees: List ───

hrRouter.get(
  '/employees',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(employees)
      .where(eq(employees.tenantId, user!.tenantId))
      .orderBy(employees.employeeNumber);

    res.json({ success: true, data: rows });
  }),
);

// ─── Employees: Get by ID ───

hrRouter.get(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [emp] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, String(req.params.id)), eq(employees.tenantId, user!.tenantId)))
      .limit(1);

    if (!emp) throw new AppError(404, 'Employee not found');
    res.json({ success: true, data: emp });
  }),
);

// ─── Employees: Create ───

hrRouter.post(
  '/employees',
  validateBody({
    employeeNumber: { required: true, type: 'string', maxLength: 50 },
    firstName: { required: true, type: 'string', maxLength: 100 },
    lastName: { required: true, type: 'string', maxLength: 100 },
    hireDate: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const {
      employeeNumber, firstName, lastName, email, phone, hireDate,
      department, jobTitle, employmentType, employmentStatus,
      salary, hourlyRate, payFrequency,
    } = req.body;

    const [emp] = await db.insert(employees).values({
      tenantId: user!.tenantId,
      employeeNumber,
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      hireDate,
      department: department || null,
      jobTitle: jobTitle || null,
      employmentType: employmentType || 'full_time',
      employmentStatus: employmentStatus || 'active',
      salary: salary ? String(salary) : null,
      hourlyRate: hourlyRate ? String(hourlyRate) : null,
      payFrequency: payFrequency || 'biweekly',
    }).returning();

    res.status(201).json({ success: true, data: emp });
  }),
);

// ─── Employees: Update ───

hrRouter.put(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const {
      firstName, lastName, email, phone, hireDate,
      department, jobTitle, employmentType, employmentStatus,
      salary, hourlyRate, payFrequency, isActive,
    } = req.body;

    const [updated] = await db
      .update(employees)
      .set({
        firstName, lastName, email, phone, hireDate,
        department, jobTitle, employmentType, employmentStatus,
        salary: salary !== undefined ? String(salary) : undefined,
        hourlyRate: hourlyRate !== undefined ? String(hourlyRate) : undefined,
        payFrequency, isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(employees.id, id), eq(employees.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Employee not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Employees: Delete ───

hrRouter.delete(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Employee not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Employees: Overview / KPIs ───

hrRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const totalEmployees = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(and(eq(employees.tenantId, user!.tenantId), eq(employees.isActive, true)));

    const activeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(and(
        eq(employees.tenantId, user!.tenantId),
        eq(employees.employmentStatus, 'active'),
      ));

    const departments = await db
      .select({ dept: employees.department, count: sql<number>`count(*)` })
      .from(employees)
      .where(and(eq(employees.tenantId, user!.tenantId), eq(employees.isActive, true)))
      .groupBy(employees.department);

    res.json({
      success: true,
      data: {
        totalEmployees: Number(totalEmployees[0].count),
        activeEmployees: Number(activeCount[0].count),
        departments: departments.length,
      },
    });
  }),
);

// ─── Payroll Periods (stub) ───

hrRouter.get(
  '/payroll-periods',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: [] });
  }),
);

// ─── Payroll Runs (stub) ───

hrRouter.get(
  '/payroll-runs',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: [] });
  }),
);

// ─── Leave Requests (stub) ───

hrRouter.get(
  '/leave-requests',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: [] });
  }),
);

// ─── Time Entries (stub) ───

hrRouter.get(
  '/time-entries',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: [] });
  }),
);

// ─── Employees: Bulk Import ───

hrRouter.post('/employees/import', requireAuth, createImportHandler(employeeImportSchema, async (rows, tenantId) => {
  await db.insert(employees).values(
    rows.map(row => ({
      tenantId,
      employeeNumber: String(row.employeeNumber),
      firstName: String(row.firstName),
      lastName: String(row.lastName),
      email: row.email ? String(row.email) : null,
      phone: row.phone ? String(row.phone) : null,
      hireDate: String(row.hireDate),
      department: row.department ? String(row.department) : null,
      jobTitle: row.jobTitle ? String(row.jobTitle) : null,
      employmentType: (row.employmentType as any) || 'full_time',
      employmentStatus: 'active' as const,
      salary: row.salary ? String(row.salary) : null,
      hourlyRate: row.hourlyRate ? String(row.hourlyRate) : null,
      payFrequency: (row.payFrequency as any) || 'biweekly',
      isActive: row.isActive !== false,
    }))
  );
}));
