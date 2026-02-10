import type { UUID, ISODate, ISOTimestamp, AuditFields } from './common';

// ─── Chart of Accounts ───

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export interface Account extends AuditFields {
  id: UUID;
  tenantId: UUID;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: UUID;
  level: number;
  isActive: boolean;
  isSystemAccount: boolean;
  normalBalance: NormalBalance;
  description?: string;
}

// ─── Fiscal Periods ───

export type PeriodType = 'month' | 'quarter' | 'year';

export interface FiscalPeriod extends AuditFields {
  id: UUID;
  tenantId: UUID;
  periodName: string;
  periodType: PeriodType;
  startDate: ISODate;
  endDate: ISODate;
  isClosed: boolean;
  closedAt?: ISOTimestamp;
  closedBy?: UUID;
}

// ─── Journal Entries ───

export type JournalEntryType = 'manual' | 'adjusting' | 'recurring' | 'reversing' | 'auto';
export type JournalEntryStatus = 'draft' | 'posted' | 'voided';

export interface JournalEntry extends AuditFields {
  id: UUID;
  tenantId: UUID;
  entryNumber: string;
  entryDate: ISODate;
  fiscalPeriodId?: UUID;
  entryType: JournalEntryType;
  referenceNumber?: string;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  status: JournalEntryStatus;
  postedAt?: ISOTimestamp;
  postedBy?: UUID;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: UUID;
  journalEntryId: UUID;
  accountId: UUID;
  accountNumber?: string;
  accountName?: string;
  lineNumber: number;
  description?: string;
  debitAmount: number;
  creditAmount: number;
}

// ─── Account Balances ───

export interface AccountBalance {
  id: UUID;
  tenantId: UUID;
  accountId: UUID;
  fiscalPeriodId: UUID;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
}

// ─── Financial Statements ───

export type StatementType = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance';

export interface FinancialStatement {
  type: StatementType;
  asOfDate: ISODate;
  periodStart?: ISODate;
  periodEnd?: ISODate;
  sections: FinancialStatementSection[];
  totals: Record<string, number>;
}

export interface FinancialStatementSection {
  label: string;
  accounts: FinancialStatementRow[];
  subtotal: number;
}

export interface FinancialStatementRow {
  accountId: UUID;
  accountNumber: string;
  accountName: string;
  balance: number;
  priorBalance?: number;
  change?: number;
  changePercent?: number;
}

// ─── Currencies ───

export interface CurrencyRate {
  id: UUID;
  tenantId: UUID;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: ISODate;
}
