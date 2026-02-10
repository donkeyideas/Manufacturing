import type { ImportSchema } from './types';

export const warehouseImportSchema: ImportSchema = {
  entityType: 'warehouse',
  entityLabel: 'Warehouses',
  module: 'inventory',
  migrationOrder: 7,
  apiEndpoint: '/api/inventory/warehouses/import',
  templateFilename: 'warehouses_import_template.csv',
  description: 'Import warehouse and storage location master data',
  fields: [
    {
      fieldName: 'warehouseCode',
      label: 'Warehouse Code',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Warehouse Code', 'warehouse_code', 'Code', 'WH Code', 'wh_code', 'Location Code'],
      helpText: 'Unique code identifying the warehouse'
    },
    {
      fieldName: 'warehouseName',
      label: 'Warehouse Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Warehouse Name', 'warehouse_name', 'Name', 'Location Name', 'location_name'],
      helpText: 'Full descriptive name of the warehouse'
    },
    {
      fieldName: 'city',
      label: 'City',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['City', 'Town', 'Municipality'],
      helpText: 'City where the warehouse is located'
    },
    {
      fieldName: 'state',
      label: 'State',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['State', 'Province', 'Region', 'State/Province'],
      helpText: 'State or province of the warehouse'
    },
    {
      fieldName: 'country',
      label: 'Country',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Country', 'Nation'],
      helpText: 'Country where the warehouse is located'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the warehouse is currently active'
    },
    {
      fieldName: 'isDefault',
      label: 'Is Default',
      type: 'boolean',
      required: false,
      defaultValue: false,
      aliases: ['Is Default', 'is_default', 'Default', 'Primary', 'Main'],
      helpText: 'Whether this is the default warehouse for transactions'
    }
  ]
};
