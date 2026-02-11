import type { ImportSchema } from './types';

export const journalEntryImportSchema: ImportSchema = {
  entityType: 'journal-entry',
  entityLabel: 'Journal Entries',
  module: 'financial',
  migrationOrder: 14,
  apiEndpoint: '/api/financial/journal-entries/import',
  templateFilename: 'journal_entries_import_template.csv',
  description: 'Import general ledger journal entries with debit and credit amounts',
  dependencies: ['account'],
  fields: [
    {
      fieldName: 'entryNumber',
      label: 'Entry Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Entry Number', 'entry_number', 'JE Number', 'je_number', 'Journal Entry #', 'JE #', 'Entry ID'],
      helpText: 'Unique journal entry number'
    },
    {
      fieldName: 'entryDate',
      label: 'Entry Date',
      type: 'date',
      required: true,
      aliases: ['Entry Date', 'entry_date', 'Date', 'Journal Date', 'journal_date', 'Posting Date'],
      helpText: 'Date of the journal entry'
    },
    {
      fieldName: 'accountNumber',
      label: 'Account Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Account Number', 'account_number', 'Account #', 'Account Code', 'account_code', 'GL Account'],
      helpText: 'Account number from chart of accounts'
    },
    {
      fieldName: 'debitAmount',
      label: 'Debit Amount',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Debit Amount', 'debit_amount', 'Debit', 'DR', 'DR Amount', 'dr_amount'],
      helpText: 'Debit amount (leave blank if credit entry)'
    },
    {
      fieldName: 'creditAmount',
      label: 'Credit Amount',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Credit Amount', 'credit_amount', 'Credit', 'CR', 'CR Amount', 'cr_amount'],
      helpText: 'Credit amount (leave blank if debit entry)'
    },
    {
      fieldName: 'description',
      label: 'Description',
      type: 'string',
      required: false,
      maxLength: 500,
      aliases: ['Description', 'Notes', 'Memo', 'Comments', 'Narrative'],
      helpText: 'Description or narrative for the journal entry line'
    },
    {
      fieldName: 'referenceNumber',
      label: 'Reference Number',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['Reference Number', 'reference_number', 'Reference', 'Ref', 'Ref #', 'Document Number'],
      helpText: 'Reference or document number related to this entry'
    }
  ]
};
