import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { accounts, journalEntries, journalLines } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';
import { createImportHandler } from '../../core/importHandler.js';
import { accountImportSchema, journalEntryImportSchema } from '@erp/shared';

export const financialRouter = Router();
financialRouter.use(requireAuth);

// ─── Chart of Accounts ───

financialRouter.get(
  '/accounts',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, user!.tenantId))
      .orderBy(accounts.accountNumber);

    res.json({ success: true, data: rows });
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

    res.json({ success: true, data: rows });
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
      .select()
      .from(journalLines)
      .where(eq(journalLines.journalEntryId, id))
      .orderBy(journalLines.lineNumber);

    res.json({ success: true, data: { ...entry, lines } });
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
      totalDebit += Number(line.debitAmount || 0);
      totalCredit += Number(line.creditAmount || 0);
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

    // Insert lines
    for (let i = 0; i < lineItems.length; i++) {
      const line = lineItems[i];
      await db.insert(journalLines).values({
        journalEntryId: entry.id,
        accountId: line.accountId,
        description: line.description,
        debitAmount: String(line.debitAmount || 0),
        creditAmount: String(line.creditAmount || 0),
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

// ─── Financial Overview / KPIs ───

financialRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const allAccounts = await db
      .select({ accountType: accounts.accountType, balance: accounts.balance })
      .from(accounts)
      .where(eq(accounts.tenantId, user!.tenantId));

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const acc of allAccounts) {
      const balance = Number(acc.balance || 0);
      switch (acc.accountType) {
        case 'revenue': totalRevenue += balance; break;
        case 'expense': totalExpenses += balance; break;
        case 'asset': totalAssets += balance; break;
        case 'liability': totalLiabilities += balance; break;
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
