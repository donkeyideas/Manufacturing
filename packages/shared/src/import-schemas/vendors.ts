import type { ImportSchema } from './types';

export const vendorImportSchema: ImportSchema = {
  entityType: 'vendor',
  entityLabel: 'Vendors',
  module: 'procurement',
  migrationOrder: 3,
  apiEndpoint: '/api/procurement/vendors/import',
  templateFilename: 'vendors_import_template.csv',
  description: 'Import vendor master data including contact and payment information',
  fields: [
    {
      fieldName: 'vendorNumber',
      label: 'Vendor Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Vendor Number', 'vendor_number', 'Vendor #', 'Vendor ID', 'vendor_id', 'VendorNo', 'Supplier Number'],
      helpText: 'Unique identifier for the vendor'
    },
    {
      fieldName: 'vendorName',
      label: 'Vendor Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Vendor Name', 'vendor_name', 'Name', 'Company Name', 'company_name', 'Supplier Name'],
      helpText: 'Full legal or business name of the vendor'
    },
    {
      fieldName: 'contactName',
      label: 'Contact Name',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Contact Name', 'contact_name', 'Contact', 'Primary Contact', 'primary_contact'],
      helpText: 'Primary contact person at the vendor'
    },
    {
      fieldName: 'contactEmail',
      label: 'Contact Email',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Contact Email', 'contact_email', 'Email', 'Email Address', 'email_address'],
      helpText: 'Primary email address for communication'
    },
    {
      fieldName: 'contactPhone',
      label: 'Contact Phone',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['Contact Phone', 'contact_phone', 'Phone', 'Phone Number', 'phone_number', 'Tel'],
      helpText: 'Primary phone number for the vendor'
    },
    {
      fieldName: 'paymentTerms',
      label: 'Payment Terms',
      type: 'string',
      required: false,
      maxLength: 50,
      defaultValue: 'Net 30',
      aliases: ['Payment Terms', 'payment_terms', 'Terms', 'Credit Terms', 'credit_terms'],
      helpText: 'Standard payment terms (e.g., Net 30, 2/10 Net 30)'
    },
    {
      fieldName: 'creditLimit',
      label: 'Credit Limit',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Credit Limit', 'credit_limit', 'Credit', 'Max Credit', 'max_credit'],
      helpText: 'Maximum credit available from the vendor'
    },
    {
      fieldName: 'is1099Eligible',
      label: 'Is 1099 Eligible',
      type: 'boolean',
      required: false,
      defaultValue: false,
      aliases: ['Is 1099 Eligible', 'is_1099_eligible', '1099 Eligible', '1099', 'Tax Reporting'],
      helpText: 'Whether vendor requires 1099 tax reporting (US)'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the vendor is currently active'
    }
  ]
};
