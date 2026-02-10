import type { ImportSchema } from './types';

export const accountImportSchema: ImportSchema = {
  entityType: 'account',
  entityLabel: 'Chart of Accounts',
  module: 'financial',
  migrationOrder: 5,
  apiEndpoint: '/api/financial/accounts/import',
  templateFilename: 'accounts_import_template.csv',
  description: 'Import general ledger chart of accounts with account hierarchy',
  fields: [
    {
      fieldName: 'accountNumber',
      label: 'Account Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Account Number', 'account_number', 'Account #', 'Account Code', 'account_code', 'GL Account'],
      helpText: 'Unique account number or code'
    },
    {
      fieldName: 'accountName',
      label: 'Account Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Account Name', 'account_name', 'Name', 'Description', 'Account Description'],
      helpText: 'Descriptive name of the account'
    },
    {
      fieldName: 'accountType',
      label: 'Account Type',
      type: 'enum',
      required: true,
      enumValues: ['asset', 'liability', 'equity', 'revenue', 'expense'],
      enumLabels: {
        asset: 'Asset',
        liability: 'Liability',
        equity: 'Equity',
        revenue: 'Revenue',
        expense: 'Expense'
      },
      aliases: ['Account Type', 'account_type', 'Type', 'Category', 'Account Category'],
      helpText: 'Primary classification of the account'
    },
    {
      fieldName: 'normalBalance',
      label: 'Normal Balance',
      type: 'enum',
      required: false,
      enumValues: ['debit', 'credit'],
      enumLabels: {
        debit: 'Debit',
        credit: 'Credit'
      },
      aliases: ['Normal Balance', 'normal_balance', 'Balance Type', 'balance_type', 'DR/CR'],
      helpText: 'Natural balance side for the account (debit or credit)'
    },
    {
      fieldName: 'description',
      label: 'Description',
      type: 'string',
      required: false,
      maxLength: 1000,
      aliases: ['Description', 'Notes', 'Comments', 'Details'],
      helpText: 'Additional details about the account'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the account is currently active'
    },
    {
      fieldName: 'parentAccountId',
      label: 'Parent Account ID',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['Parent Account ID', 'parent_account_id', 'Parent Account', 'parent_account', 'Parent'],
      helpText: 'Account number of the parent account for hierarchy'
    }
  ]
};
