import type { ImportSchema } from './types';

export const customerImportSchema: ImportSchema = {
  entityType: 'customer',
  entityLabel: 'Customers',
  module: 'sales',
  migrationOrder: 2,
  apiEndpoint: '/api/sales/customers/import',
  templateFilename: 'customers_import_template.csv',
  description: 'Import customer master data including contact and credit information',
  fields: [
    {
      fieldName: 'customerNumber',
      label: 'Customer Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Customer Number', 'customer_number', 'Customer #', 'Customer ID', 'customer_id', 'CustomerNo'],
      helpText: 'Unique identifier for the customer'
    },
    {
      fieldName: 'customerName',
      label: 'Customer Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Customer Name', 'customer_name', 'Name', 'Company Name', 'company_name'],
      helpText: 'Full legal or business name of the customer'
    },
    {
      fieldName: 'contactName',
      label: 'Contact Name',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Contact Name', 'contact_name', 'Contact', 'Primary Contact', 'primary_contact'],
      helpText: 'Primary contact person at the customer'
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
      helpText: 'Primary phone number for the customer'
    },
    {
      fieldName: 'paymentTerms',
      label: 'Payment Terms',
      type: 'string',
      required: false,
      maxLength: 50,
      defaultValue: 'Net 30',
      aliases: ['Payment Terms', 'payment_terms', 'Terms', 'Credit Terms', 'credit_terms'],
      helpText: 'Standard payment terms (e.g., Net 30, Net 60, Due on Receipt)'
    },
    {
      fieldName: 'creditLimit',
      label: 'Credit Limit',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Credit Limit', 'credit_limit', 'Credit', 'Max Credit', 'max_credit'],
      helpText: 'Maximum credit extended to the customer'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the customer is currently active'
    }
  ]
};
