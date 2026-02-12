import { Router } from 'express';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import {
  accounts, journalEntries, journalLines,
  salesOrders, salesOrderLines, customers,
  purchaseOrders, vendors, items,
  workOrders, employees, fixedAssets,
} from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { accountImportSchema, journalEntryImportSchema } from '@erp/shared';

export const financialRouter = Router();
financialRouter.use(requireAuth);

// ─── Helper: compute account balances from posted journal lines ───

async function computeAccountBalances(tenantId: string) {
  const balances = await db
    .select({
      accountId: journalLines.accountId,
      totalDebit: sql<number>`coalesce(sum(cast(${journalLines.debitAmount} as numeric)), 0)`,
      totalCredit: sql<number>`coalesce(sum(cast(${journalLines.creditAmount} as numeric)), 0)`,
    })
    .from(journalLines)
    .innerJoin(journalEntries, eq(journalEntries.id, journalLines.journalEntryId))
    .where(and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.status, 'posted'),
    ))
    .groupBy(journalLines.accountId);

  return new Map(
    balances.map(b => [b.accountId, { debit: Number(b.totalDebit), credit: Number(b.totalCredit) }])
  );
}

// ─── Chart of Accounts ───

financialRouter.get(
  '/accounts',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Get all accounts
    const allAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, user!.tenantId))
      .orderBy(accounts.accountNumber);

    // Compute actual balances from POSTED journal entry lines
    const balanceMap = await computeAccountBalances(user!.tenantId);

    // Merge computed balances into account data
    const data = allAccounts.map(acc => {
      const bal = balanceMap.get(acc.id) ?? { debit: 0, credit: 0 };
      // Debit-normal accounts (asset, expense): balance = debit - credit
      // Credit-normal accounts (liability, equity, revenue): balance = credit - debit
      const isDebitNormal = acc.accountType === 'asset' || acc.accountType === 'expense';
      const computedBalance = isDebitNormal ? (bal.debit - bal.credit) : (bal.credit - bal.debit);
      return { ...acc, balance: String(computedBalance) };
    });

    res.json({ success: true, data });
  }),
);

financialRouter.post(
  '/accounts',
  validateBody({
    accountNumber: { required: true, type: 'string', maxLength: 20 },
    accountName: { required: true, type: 'string', maxLength: 255 },
    accountType: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { accountNumber, accountName, accountType, parentAccountId, description, currency } = req.body;

    const [account] = await db.insert(accounts).values({
      tenantId: user!.tenantId,
      accountNumber,
      accountName,
      accountType,
      parentAccountId,
      description,
      currency: currency || 'USD',
    }).returning();

    res.status(201).json({ success: true, data: account });
  }),
);

financialRouter.put(
  '/accounts/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const { accountName, accountType, description, isActive, currency } = req.body;

    const [updated] = await db
      .update(accounts)
      .set({ accountName, accountType, description, isActive, currency, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Account not found');
    res.json({ success: true, data: updated });
  }),
);

financialRouter.delete(
  '/accounts/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    // Check if account has journal lines
    const lineCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalLines)
      .where(eq(journalLines.accountId, id));

    if (Number(lineCount[0].count) > 0) {
      throw new AppError(400, 'Cannot delete account with journal entries. Deactivate it instead.');
    }

    const [deleted] = await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Account not found');
    res.json({ success: true, data: deleted });
  }),
);

// ─── Journal Entries ───

financialRouter.get(
  '/journal-entries',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, user!.tenantId))
      .orderBy(desc(journalEntries.entryDate));

    // Fetch ALL lines in one query (avoids N+1 problem)
    const allLines = rows.length > 0
      ? await db
          .select({
            journalEntryId: journalLines.journalEntryId,
            accountNumber: accounts.accountNumber,
            accountName: accounts.accountName,
            description: journalLines.description,
            debitAmount: journalLines.debitAmount,
            creditAmount: journalLines.creditAmount,
            lineNumber: journalLines.lineNumber,
          })
          .from(journalLines)
          .leftJoin(accounts, eq(journalLines.accountId, accounts.id))
          .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
          .where(eq(journalEntries.tenantId, user!.tenantId))
          .orderBy(journalLines.lineNumber)
      : [];

    // Group lines by entry ID
    const linesMap = new Map<string, typeof allLines>();
    for (const line of allLines) {
      if (!linesMap.has(line.journalEntryId)) linesMap.set(line.journalEntryId, []);
      linesMap.get(line.journalEntryId)!.push(line);
    }

    const data = rows.map(entry => ({
      ...entry,
      lineItems: (linesMap.get(entry.id) ?? []).map(l => ({
        accountNumber: l.accountNumber,
        accountName: l.accountName,
        description: l.description,
        debit: Number(l.debitAmount ?? 0),
        credit: Number(l.creditAmount ?? 0),
      })),
    }));

    res.json({ success: true, data });
  }),
);

financialRouter.get(
  '/journal-entries/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, user!.tenantId)))
      .limit(1);

    if (!entry) throw new AppError(404, 'Journal entry not found');

    const lines = await db
      .select({
        id: journalLines.id,
        accountId: journalLines.accountId,
        accountNumber: accounts.accountNumber,
        accountName: accounts.accountName,
        description: journalLines.description,
        debitAmount: journalLines.debitAmount,
        creditAmount: journalLines.creditAmount,
        lineNumber: journalLines.lineNumber,
      })
      .from(journalLines)
      .leftJoin(accounts, eq(journalLines.accountId, accounts.id))
      .where(eq(journalLines.journalEntryId, id))
      .orderBy(journalLines.lineNumber);

    res.json({
      success: true,
      data: {
        ...entry,
        lineItems: lines.map(l => ({
          accountNumber: l.accountNumber,
          accountName: l.accountName,
          description: l.description,
          debit: Number(l.debitAmount ?? 0),
          credit: Number(l.creditAmount ?? 0),
        })),
      },
    });
  }),
);

financialRouter.post(
  '/journal-entries',
  validateBody({
    entryDate: { required: true, type: 'string' },
    description: { required: false, type: 'string' },
    lines: { required: true, type: 'array' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { entryDate, description, lines: lineItems } = req.body;

    // Generate entry number
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, user!.tenantId));
    const entryNumber = `JE-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lineItems) {
      totalDebit += Number(line.debitAmount || line.debit || 0);
      totalCredit += Number(line.creditAmount || line.credit || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new AppError(400, 'Journal entry must balance: debits must equal credits');
    }

    const [entry] = await db.insert(journalEntries).values({
      tenantId: user!.tenantId,
      entryNumber,
      entryDate,
      description,
      totalDebit: String(totalDebit),
      totalCredit: String(totalCredit),
      createdBy: user!.userId,
    }).returning();

    // Insert lines - resolve account by ID or by accountNumber
    for (let i = 0; i < lineItems.length; i++) {
      const line = lineItems[i];
      let accountId = line.accountId;

      // If no accountId but has accountNumber, resolve it
      if (!accountId && line.accountNumber) {
        const [found] = await db
          .select()
          .from(accounts)
          .where(and(eq(accounts.accountNumber, String(line.accountNumber)), eq(accounts.tenantId, user!.tenantId)))
          .limit(1);
        if (found) accountId = found.id;
      }

      await db.insert(journalLines).values({
        journalEntryId: entry.id,
        accountId: accountId || null,
        description: line.description,
        debitAmount: String(line.debitAmount || line.debit || 0),
        creditAmount: String(line.creditAmount || line.credit || 0),
        lineNumber: i + 1,
      });
    }

    res.status(201).json({ success: true, data: entry });
  }),
);

financialRouter.post(
  '/journal-entries/:id/post',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, user!.tenantId)))
      .limit(1);

    if (!entry) throw new AppError(404, 'Journal entry not found');
    if (entry.status === 'posted') throw new AppError(400, 'Entry is already posted');

    const [updated] = await db
      .update(journalEntries)
      .set({ status: 'posted', postedAt: new Date(), updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();

    res.json({ success: true, data: updated });
  }),
);

financialRouter.delete(
  '/journal-entries/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, user!.tenantId)))
      .limit(1);

    if (!entry) throw new AppError(404, 'Journal entry not found');
    if (entry.status === 'posted') throw new AppError(400, 'Cannot delete a posted journal entry');

    // Delete lines first, then header
    await db.delete(journalLines).where(eq(journalLines.journalEntryId, id));
    const [deleted] = await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, user!.tenantId)))
      .returning();

    res.json({ success: true, data: deleted });
  }),
);

// ─── Financial Overview / KPIs ───

financialRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    // Get all accounts
    const allAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, user!.tenantId));

    // Compute balances from posted journal lines
    const balanceMap = await computeAccountBalances(user!.tenantId);

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const acc of allAccounts) {
      const bal = balanceMap.get(acc.id) ?? { debit: 0, credit: 0 };
      const isDebitNormal = acc.accountType === 'asset' || acc.accountType === 'expense';
      const computedBalance = isDebitNormal ? (bal.debit - bal.credit) : (bal.credit - bal.debit);

      switch (acc.accountType) {
        case 'revenue': totalRevenue += computedBalance; break;
        case 'expense': totalExpenses += computedBalance; break;
        case 'asset': totalAssets += computedBalance; break;
        case 'liability': totalLiabilities += computedBalance; break;
      }
    }

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        totalAssets,
        totalLiabilities,
        equity: totalAssets - totalLiabilities,
      },
    });
  }),
);

// ─── Auto-Generate Journal Entries from All Module Transactions ───

financialRouter.post(
  '/sync',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const tenantId = user!.tenantId;

    // ── 1. Build account lookup by accountNumber ──
    const allAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
    const acctByNum = new Map(allAccounts.map(a => [a.accountNumber, a.id]));

    // Smart account finder: tries each candidate number, then prefix match
    function findAcct(...candidates: string[]): string | null {
      for (const c of candidates) {
        const exact = acctByNum.get(c);
        if (exact) return exact;
      }
      for (const c of candidates) {
        for (const [num, id] of acctByNum) {
          if (num.startsWith(c)) return id;
        }
      }
      return null;
    }

    // Map key GL accounts
    const ACCT = {
      CASH:            findAcct('1000', '1020'),
      AR:              findAcct('1100', '1110'),
      RAW_MATERIALS:   findAcct('1210', '1200', '1300'),
      WIP:             findAcct('1220', '1310'),
      FINISHED_GOODS:  findAcct('1230', '1320'),
      FIXED_ASSETS:    findAcct('1500', '1600'),
      ACCUM_DEPR:      findAcct('1510', '1550', '1610'),
      AP:              findAcct('2000', '2010'),
      ACCRUED_PAYROLL: findAcct('2100', '2110'),
      SALES_TAX:       findAcct('2200', '2210'),
      REVENUE:         findAcct('4000', '4010', '4100'),
      COGS:            findAcct('5000', '5010'),
      PAYROLL_EXP:     findAcct('5100', '5110', '6100'),
      DEPR_EXP:        findAcct('5400', '5410', '6400'),
    };

    // ── 2. Delete previous auto-generated entries ──
    const autoEntries = await db.select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(
        eq(journalEntries.tenantId, tenantId),
        sql`${journalEntries.description} LIKE '[AUTO]%'`,
      ));

    for (const e of autoEntries) {
      await db.delete(journalLines).where(eq(journalLines.journalEntryId, e.id));
    }
    if (autoEntries.length > 0) {
      await db.delete(journalEntries).where(and(
        eq(journalEntries.tenantId, tenantId),
        sql`${journalEntries.description} LIKE '[AUTO]%'`,
      ));
    }

    // ── 3. JE creation helper ──
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(journalEntries).where(eq(journalEntries.tenantId, tenantId));
    let nextNum = Number(countResult[0].count) + 1;

    let generated = 0;
    let totalAmount = 0;
    const breakdown: Record<string, number> = {};

    async function createJE(
      date: string,
      desc: string,
      category: string,
      lines: { acctId: string | null; debit: number; credit: number; desc: string }[],
    ) {
      const valid = lines.filter(l => l.acctId && (l.debit > 0 || l.credit > 0));
      if (valid.length < 2) return;
      const td = Math.round(valid.reduce((s, l) => s + l.debit, 0) * 100) / 100;
      const tc = Math.round(valid.reduce((s, l) => s + l.credit, 0) * 100) / 100;
      if (Math.abs(td - tc) > 0.01 || td === 0) return;

      const entryNumber = `JE-${String(nextNum++).padStart(5, '0')}`;
      const [entry] = await db.insert(journalEntries).values({
        tenantId,
        entryNumber,
        entryDate: date,
        description: `[AUTO] ${desc}`,
        status: 'posted',
        totalDebit: String(td),
        totalCredit: String(tc),
        createdBy: user!.userId,
        postedAt: new Date(),
      }).returning();

      for (let i = 0; i < valid.length; i++) {
        await db.insert(journalLines).values({
          journalEntryId: entry.id,
          accountId: valid[i].acctId!,
          description: valid[i].desc,
          debitAmount: String(Math.round(valid[i].debit * 100) / 100),
          creditAmount: String(Math.round(valid[i].credit * 100) / 100),
          lineNumber: i + 1,
        });
      }
      generated++;
      totalAmount += td;
      breakdown[category] = (breakdown[category] || 0) + td;
    }

    // ── Pre-fetch shared data ──
    const allItems = await db.select().from(items).where(eq(items.tenantId, tenantId));
    const itemCostMap = new Map(allItems.map(i => [i.id, Number(i.unitCost ?? 0)]));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ════════════════════════════════════════════
    // 4. SALES ORDERS → Revenue + COGS + Collections
    // ════════════════════════════════════════════
    const revenueStatuses = ['shipped', 'delivered', 'invoiced', 'closed'] as const;
    const sos = await db.select().from(salesOrders)
      .where(and(eq(salesOrders.tenantId, tenantId), inArray(salesOrders.status, [...revenueStatuses])));

    const allCustomers = await db.select().from(customers).where(eq(customers.tenantId, tenantId));
    const customerMap = new Map(allCustomers.map(c => [c.id, c.customerName]));

    // Pre-fetch all SO lines with item cost
    const soLineRows = sos.length > 0
      ? await db.select({
          salesOrderId: salesOrderLines.salesOrderId,
          itemId: salesOrderLines.itemId,
          quantityOrdered: salesOrderLines.quantityOrdered,
        }).from(salesOrderLines)
          .innerJoin(salesOrders, eq(salesOrderLines.salesOrderId, salesOrders.id))
          .where(and(eq(salesOrders.tenantId, tenantId), inArray(salesOrders.status, [...revenueStatuses])))
      : [];
    const soLinesMap = new Map<string, typeof soLineRows>();
    for (const line of soLineRows) {
      if (!soLinesMap.has(line.salesOrderId)) soLinesMap.set(line.salesOrderId, []);
      soLinesMap.get(line.salesOrderId)!.push(line);
    }

    for (const so of sos) {
      const total = Number(so.totalAmount ?? 0);
      const subtotal = Number(so.subtotal ?? 0);
      const tax = Number(so.taxAmount ?? 0);
      const custName = customerMap.get(so.customerId) ?? 'Customer';
      const dateStr = so.orderDate;
      if (total <= 0) continue;

      // Revenue recognition: DR AR, CR Revenue (+ CR Sales Tax if applicable)
      if (ACCT.AR && ACCT.REVENUE) {
        const revLines: { acctId: string | null; debit: number; credit: number; desc: string }[] = [
          { acctId: ACCT.AR, debit: total, credit: 0, desc: `AR - ${so.orderNumber}` },
          { acctId: ACCT.REVENUE, debit: 0, credit: subtotal || total, desc: `Revenue - ${so.orderNumber}` },
        ];
        if (tax > 0 && ACCT.SALES_TAX) {
          revLines.push({ acctId: ACCT.SALES_TAX, debit: 0, credit: tax, desc: `Sales Tax - ${so.orderNumber}` });
        }
        await createJE(dateStr, `Sales - ${so.orderNumber} (${custName})`, 'Sales Revenue', revLines);
      }

      // COGS: DR COGS, CR Finished Goods
      const soLines = soLinesMap.get(so.id) ?? [];
      let cogsCost = 0;
      for (const line of soLines) {
        cogsCost += Number(line.quantityOrdered ?? 0) * (itemCostMap.get(line.itemId ?? '') ?? 0);
      }
      if (cogsCost === 0 && subtotal > 0) cogsCost = subtotal * 0.60; // fallback estimate
      cogsCost = Math.round(cogsCost * 100) / 100;
      if (cogsCost > 0 && ACCT.COGS && ACCT.FINISHED_GOODS) {
        await createJE(dateStr, `COGS - ${so.orderNumber}`, 'Cost of Goods Sold', [
          { acctId: ACCT.COGS, debit: cogsCost, credit: 0, desc: `COGS - ${so.orderNumber}` },
          { acctId: ACCT.FINISHED_GOODS, debit: 0, credit: cogsCost, desc: `FG shipped - ${so.orderNumber}` },
        ]);
      }

      // Cash collection for closed/invoiced orders: DR Cash, CR AR
      if ((so.status === 'closed' || so.status === 'invoiced') && ACCT.CASH && ACCT.AR) {
        await createJE(dateStr, `Payment Received - ${so.orderNumber} (${custName})`, 'Collections', [
          { acctId: ACCT.CASH, debit: total, credit: 0, desc: `Cash received - ${so.orderNumber}` },
          { acctId: ACCT.AR, debit: 0, credit: total, desc: `AR settled - ${so.orderNumber}` },
        ]);
      }
    }

    // ════════════════════════════════════════════
    // 5. PURCHASE ORDERS → Inventory + AP + Payments
    // ════════════════════════════════════════════
    const poStatuses = ['received', 'partially_received', 'closed'] as const;
    const pos = await db.select().from(purchaseOrders)
      .where(and(eq(purchaseOrders.tenantId, tenantId), inArray(purchaseOrders.status, [...poStatuses])));

    const allVendors = await db.select().from(vendors).where(eq(vendors.tenantId, tenantId));
    const vendorMap = new Map(allVendors.map(v => [v.id, v.vendorName]));

    for (const po of pos) {
      const total = Number(po.totalAmount ?? 0);
      const subtotal = Number(po.subtotal ?? 0);
      const vendorName = vendorMap.get(po.vendorId) ?? 'Vendor';
      const dateStr = po.poDate;
      if (total <= 0) continue;

      // Purchase receipt: DR Raw Materials, CR AP
      if (ACCT.RAW_MATERIALS && ACCT.AP) {
        await createJE(dateStr, `Purchase - ${po.poNumber} (${vendorName})`, 'Purchases', [
          { acctId: ACCT.RAW_MATERIALS, debit: subtotal || total, credit: 0, desc: `Materials - ${po.poNumber}` },
          { acctId: ACCT.AP, debit: 0, credit: total, desc: `AP - ${po.poNumber}` },
        ]);
      }

      // Vendor payment for closed POs: DR AP, CR Cash
      if (po.status === 'closed' && ACCT.AP && ACCT.CASH) {
        await createJE(dateStr, `Vendor Payment - ${po.poNumber} (${vendorName})`, 'Vendor Payments', [
          { acctId: ACCT.AP, debit: total, credit: 0, desc: `AP settled - ${po.poNumber}` },
          { acctId: ACCT.CASH, debit: 0, credit: total, desc: `Payment - ${po.poNumber}` },
        ]);
      }
    }

    // ════════════════════════════════════════════
    // 6. WORK ORDERS → FG Inventory + WIP
    // ════════════════════════════════════════════
    const woStatuses = ['completed', 'closed'] as const;
    const wos = await db.select().from(workOrders)
      .where(and(eq(workOrders.tenantId, tenantId), inArray(workOrders.status, [...woStatuses])));

    for (const wo of wos) {
      const qtyCompleted = Number(wo.quantityCompleted ?? 0);
      const itemCost = itemCostMap.get(wo.itemId) ?? 0;
      let value = Math.round(qtyCompleted * itemCost * 100) / 100;
      if (value === 0 && qtyCompleted > 0) value = qtyCompleted * 50; // fallback
      const dateStr = wo.actualEndDate || wo.plannedEndDate || new Date().toISOString().slice(0, 10);

      if (value > 0 && ACCT.FINISHED_GOODS && ACCT.WIP) {
        await createJE(dateStr, `Production - ${wo.woNumber}`, 'Manufacturing', [
          { acctId: ACCT.FINISHED_GOODS, debit: value, credit: 0, desc: `FG produced - ${wo.woNumber}` },
          { acctId: ACCT.WIP, debit: 0, credit: value, desc: `WIP consumed - ${wo.woNumber}` },
        ]);
      }
    }

    // ════════════════════════════════════════════
    // 7. PAYROLL → Monthly accruals for current year
    // ════════════════════════════════════════════
    const activeEmps = await db.select().from(employees)
      .where(and(eq(employees.tenantId, tenantId), eq(employees.isActive, true)));

    let totalMonthlyPayroll = 0;
    for (const emp of activeEmps) {
      const salary = Number(emp.salary ?? 0);
      const hourly = Number(emp.hourlyRate ?? 0);
      totalMonthlyPayroll += salary > 0 ? salary / 12 : hourly * 160;
    }
    totalMonthlyPayroll = Math.round(totalMonthlyPayroll * 100) / 100;

    if (totalMonthlyPayroll > 0 && ACCT.PAYROLL_EXP && ACCT.CASH) {
      for (let m = 0; m <= currentMonth; m++) {
        const monthStr = String(m + 1).padStart(2, '0');
        await createJE(
          `${currentYear}-${monthStr}-28`,
          `Payroll - ${monthNames[m]} ${currentYear} (${activeEmps.length} employees)`,
          'Payroll',
          [
            { acctId: ACCT.PAYROLL_EXP, debit: totalMonthlyPayroll, credit: 0, desc: `Payroll expense - ${monthNames[m]}` },
            { acctId: ACCT.CASH, debit: 0, credit: totalMonthlyPayroll, desc: `Payroll payment - ${monthNames[m]}` },
          ],
        );
      }
    }

    // ════════════════════════════════════════════
    // 8. FIXED ASSETS → Acquisition + Monthly Depreciation
    // ════════════════════════════════════════════
    const activeAssets = await db.select().from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.isActive, true)));

    // Asset acquisitions
    for (const asset of activeAssets) {
      const cost = Number(asset.originalCost ?? 0);
      if (cost > 0 && ACCT.FIXED_ASSETS && ACCT.CASH) {
        await createJE(asset.acquisitionDate, `Asset Acquisition - ${asset.assetName}`, 'Fixed Assets', [
          { acctId: ACCT.FIXED_ASSETS, debit: cost, credit: 0, desc: `${asset.assetName} (${asset.assetNumber})` },
          { acctId: ACCT.CASH, debit: 0, credit: cost, desc: `Payment - ${asset.assetName}` },
        ]);
      }
    }

    // Batch monthly depreciation across all assets
    if (ACCT.DEPR_EXP && ACCT.ACCUM_DEPR) {
      const deprByMonth = new Map<string, number>();
      for (const asset of activeAssets) {
        const cost = Number(asset.originalCost ?? 0);
        const salvage = Number(asset.salvageValue ?? 0);
        const life = asset.usefulLifeYears ?? 10;
        if (cost <= 0 || life <= 0) continue;
        const monthlyDepr = Math.round((cost - salvage) / life / 12 * 100) / 100;
        if (monthlyDepr <= 0) continue;

        const acqDate = new Date(asset.acquisitionDate + 'T00:00:00');
        const acqYear = acqDate.getFullYear();
        const acqMonth = acqDate.getMonth();

        for (let y = acqYear; y <= currentYear; y++) {
          const startM = (y === acqYear) ? acqMonth + 1 : 0;
          const endM = (y === currentYear) ? currentMonth : 11;
          for (let m = startM; m <= endM; m++) {
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            deprByMonth.set(key, (deprByMonth.get(key) ?? 0) + monthlyDepr);
          }
        }
      }

      for (const [monthKey, totalDepr] of deprByMonth) {
        const rounded = Math.round(totalDepr * 100) / 100;
        const [y, m] = monthKey.split('-');
        await createJE(`${monthKey}-28`, `Depreciation - ${monthNames[parseInt(m) - 1]} ${y}`, 'Depreciation', [
          { acctId: ACCT.DEPR_EXP, debit: rounded, credit: 0, desc: 'Depreciation expense' },
          { acctId: ACCT.ACCUM_DEPR, debit: 0, credit: rounded, desc: 'Accumulated depreciation' },
        ]);
      }
    }

    res.json({
      success: true,
      data: {
        entriesGenerated: generated,
        totalAmount: Math.round(totalAmount * 100) / 100,
        breakdown,
        previousAutoEntriesCleared: autoEntries.length,
        accountsFound: Object.entries(ACCT).filter(([_, v]) => v !== null).length,
        accountsMissing: Object.entries(ACCT).filter(([_, v]) => v === null).map(([k]) => k),
      },
    });
  }),
);

// ─── GL Account Mappings per Module ───

financialRouter.get(
  '/gl-mappings',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const tenantId = user!.tenantId;

    // Get all accounts
    const allAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
    const acctByNum = new Map(allAccounts.map(a => [a.accountNumber, a]));

    // Compute real balances
    const balanceMap = await computeAccountBalances(tenantId);

    // Smart account finder
    function findAcct(...candidates: string[]): { id: string; accountNumber: string; accountName: string; balance: number; status: 'ok' | 'missing' } | null {
      for (const c of candidates) {
        const exact = acctByNum.get(c);
        if (exact) {
          const bal = balanceMap.get(exact.id) ?? { debit: 0, credit: 0 };
          const isDebitNormal = exact.accountType === 'asset' || exact.accountType === 'expense';
          const balance = isDebitNormal ? (bal.debit - bal.credit) : (bal.credit - bal.debit);
          return { id: exact.id, accountNumber: exact.accountNumber, accountName: exact.accountName, balance, status: 'ok' };
        }
      }
      // Prefix fallback
      for (const c of candidates) {
        for (const [num, acct] of acctByNum) {
          if (num.startsWith(c)) {
            const bal = balanceMap.get(acct.id) ?? { debit: 0, credit: 0 };
            const isDebitNormal = acct.accountType === 'asset' || acct.accountType === 'expense';
            const balance = isDebitNormal ? (bal.debit - bal.credit) : (bal.credit - bal.debit);
            return { id: acct.id, accountNumber: acct.accountNumber, accountName: acct.accountName, balance, status: 'ok' };
          }
        }
      }
      return null;
    }

    // Build module mappings with the expected GL accounts for each
    const modules: Record<string, Record<string, ReturnType<typeof findAcct> | { accountNumber: string; accountName: string; balance: number; status: 'missing' }>> = {
      'fixed-assets': {
        'Fixed Assets': findAcct('1500', '1600') ?? { accountNumber: '1500', accountName: 'Fixed Assets', balance: 0, status: 'missing' as const },
        'Accum. Depreciation': findAcct('1510', '1550', '1610') ?? { accountNumber: '1510', accountName: 'Accumulated Depreciation', balance: 0, status: 'missing' as const },
        'Depreciation Expense': findAcct('5400', '5410', '6400') ?? { accountNumber: '5400', accountName: 'Depreciation Expense', balance: 0, status: 'missing' as const },
      },
      'sales-orders': {
        'Accounts Receivable': findAcct('1100', '1110') ?? { accountNumber: '1100', accountName: 'Accounts Receivable', balance: 0, status: 'missing' as const },
        'Revenue': findAcct('4000', '4010', '4100') ?? { accountNumber: '4000', accountName: 'Revenue', balance: 0, status: 'missing' as const },
        'COGS': findAcct('5000', '5010') ?? { accountNumber: '5000', accountName: 'Cost of Goods Sold', balance: 0, status: 'missing' as const },
        'Finished Goods': findAcct('1230', '1320') ?? { accountNumber: '1230', accountName: 'Finished Goods Inventory', balance: 0, status: 'missing' as const },
      },
      'customers': {
        'Accounts Receivable': findAcct('1100', '1110') ?? { accountNumber: '1100', accountName: 'Accounts Receivable', balance: 0, status: 'missing' as const },
        'Cash': findAcct('1000', '1020') ?? { accountNumber: '1000', accountName: 'Cash', balance: 0, status: 'missing' as const },
      },
      'purchase-orders': {
        'Raw Materials': findAcct('1210', '1200', '1300') ?? { accountNumber: '1210', accountName: 'Raw Materials Inventory', balance: 0, status: 'missing' as const },
        'Accounts Payable': findAcct('2000', '2010') ?? { accountNumber: '2000', accountName: 'Accounts Payable', balance: 0, status: 'missing' as const },
        'Cash': findAcct('1000', '1020') ?? { accountNumber: '1000', accountName: 'Cash', balance: 0, status: 'missing' as const },
      },
      'vendors': {
        'Accounts Payable': findAcct('2000', '2010') ?? { accountNumber: '2000', accountName: 'Accounts Payable', balance: 0, status: 'missing' as const },
        'Cash': findAcct('1000', '1020') ?? { accountNumber: '1000', accountName: 'Cash', balance: 0, status: 'missing' as const },
      },
      'work-orders': {
        'Finished Goods': findAcct('1230', '1320') ?? { accountNumber: '1230', accountName: 'Finished Goods Inventory', balance: 0, status: 'missing' as const },
        'Work in Progress': findAcct('1220', '1310') ?? { accountNumber: '1220', accountName: 'Work in Progress', balance: 0, status: 'missing' as const },
      },
      'boms': {
        'Raw Materials': findAcct('1210', '1200', '1300') ?? { accountNumber: '1210', accountName: 'Raw Materials Inventory', balance: 0, status: 'missing' as const },
        'Finished Goods': findAcct('1230', '1320') ?? { accountNumber: '1230', accountName: 'Finished Goods Inventory', balance: 0, status: 'missing' as const },
      },
      'items': {
        'Raw Materials': findAcct('1210', '1200', '1300') ?? { accountNumber: '1210', accountName: 'Raw Materials Inventory', balance: 0, status: 'missing' as const },
        'Work in Progress': findAcct('1220', '1310') ?? { accountNumber: '1220', accountName: 'Work in Progress', balance: 0, status: 'missing' as const },
        'Finished Goods': findAcct('1230', '1320') ?? { accountNumber: '1230', accountName: 'Finished Goods Inventory', balance: 0, status: 'missing' as const },
      },
      'employees': {
        'Payroll Expense': findAcct('5100', '5110', '6100') ?? { accountNumber: '5100', accountName: 'Payroll Expense', balance: 0, status: 'missing' as const },
        'Cash': findAcct('1000', '1020') ?? { accountNumber: '1000', accountName: 'Cash', balance: 0, status: 'missing' as const },
      },
    };

    res.json({ success: true, data: modules });
  }),
);

// ─── Fiscal Periods ───

financialRouter.get('/fiscal-periods', asyncHandler(async (_req, res) => {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const data = months.map((m, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    const daysInMonth = new Date(year, i + 1, 0).getDate();
    const isPast = i < currentMonth;
    return {
      id: `fp-${year}-${monthNum}`,
      periodName: `${m} ${year}`,
      startDate: `${year}-${monthNum}-01`,
      endDate: `${year}-${monthNum}-${String(daysInMonth).padStart(2, '0')}`,
      status: isPast ? 'closed' : 'open',
      closedBy: isPast ? 'System' : null,
      closedAt: isPast ? `${year}-${monthNum}-${String(daysInMonth).padStart(2, '0')}T23:59:59Z` : null,
    };
  });

  res.json({ success: true, data });
}));

// ─── Currencies ───

financialRouter.get('/currencies', asyncHandler(async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const data = [
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0000, isBase: true, isActive: true, lastUpdated: today },
    { code: 'EUR', name: 'Euro', symbol: '\u20ac', exchangeRate: 0.9234, isBase: false, isActive: true, lastUpdated: today },
    { code: 'GBP', name: 'British Pound', symbol: '\u00a3', exchangeRate: 0.7892, isBase: false, isActive: true, lastUpdated: today },
    { code: 'JPY', name: 'Japanese Yen', symbol: '\u00a5', exchangeRate: 149.5000, isBase: false, isActive: true, lastUpdated: today },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.3542, isBase: false, isActive: true, lastUpdated: today },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.5321, isBase: false, isActive: true, lastUpdated: today },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '\u00a5', exchangeRate: 7.2456, isBase: false, isActive: true, lastUpdated: today },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', exchangeRate: 17.1234, isBase: false, isActive: true, lastUpdated: today },
  ];
  res.json({ success: true, data });
}));

// ─── Bulk Import ───

financialRouter.post('/accounts/import', requireAuth, createImportHandler(accountImportSchema, async (rows, tenantId) => {
  await db.insert(accounts).values(
    rows.map(row => ({
      tenantId,
      accountNumber: String(row.accountNumber),
      accountName: String(row.accountName),
      accountType: String(row.accountType),
      description: row.description ? String(row.description) : null,
      isActive: row.isActive !== false,
      balance: '0',
      currency: 'USD',
    }))
  );
}));

financialRouter.post('/journal-entries/import', requireAuth, createImportHandler(journalEntryImportSchema, async (rows, tenantId) => {
  // Group rows by entry number
  const entryMap = new Map<string, typeof rows>();
  for (const row of rows) {
    const entryNumber = String(row.entryNumber);
    if (!entryMap.has(entryNumber)) {
      entryMap.set(entryNumber, []);
    }
    entryMap.get(entryNumber)!.push(row);
  }

  // Process each journal entry
  for (const [entryNumber, entryRows] of entryMap) {
    const firstRow = entryRows[0];

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    for (const row of entryRows) {
      totalDebit += Number(row.debitAmount || 0);
      totalCredit += Number(row.creditAmount || 0);
    }

    // Skip unbalanced entries
    if (Math.abs(totalDebit - totalCredit) > 0.01) continue;

    // Insert journal entry header
    const [entry] = await db.insert(journalEntries).values({
      tenantId,
      entryNumber,
      entryDate: String(firstRow.entryDate),
      description: firstRow.description ? String(firstRow.description) : null,
      status: 'draft',
      totalDebit: String(totalDebit),
      totalCredit: String(totalCredit),
    }).returning();

    // Insert journal lines
    for (let i = 0; i < entryRows.length; i++) {
      const row = entryRows[i];
      const accountNumber = String(row.accountNumber);

      // Find account by account number
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.accountNumber, accountNumber), eq(accounts.tenantId, tenantId)))
        .limit(1);

      if (!account) continue; // Skip if account not found

      await db.insert(journalLines).values({
        journalEntryId: entry.id,
        accountId: account.id,
        description: row.description ? String(row.description) : null,
        debitAmount: String(row.debitAmount || 0),
        creditAmount: String(row.creditAmount || 0),
        lineNumber: i + 1,
      });
    }
  }
}));
