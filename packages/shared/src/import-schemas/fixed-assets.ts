import type { ImportSchema } from './types';

export const fixedAssetImportSchema: ImportSchema = {
  entityType: 'fixed-asset',
  entityLabel: 'Fixed Assets',
  module: 'assets',
  migrationOrder: 6,
  apiEndpoint: '/api/assets/fixed-assets/import',
  templateFilename: 'fixed_assets_import_template.csv',
  description: 'Import fixed assets including acquisition details and depreciation parameters',
  dependencies: ['account'],
  fields: [
    {
      fieldName: 'assetNumber',
      label: 'Asset Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Asset Number', 'asset_number', 'Asset #', 'Asset ID', 'asset_id', 'AssetNo'],
      helpText: 'Unique identifier for the fixed asset'
    },
    {
      fieldName: 'assetName',
      label: 'Asset Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Asset Name', 'asset_name', 'Name', 'Description', 'Asset Description'],
      helpText: 'Descriptive name of the fixed asset'
    },
    {
      fieldName: 'assetCategory',
      label: 'Asset Category',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Asset Category', 'asset_category', 'Category', 'Type', 'Class'],
      helpText: 'Category or class of the asset (e.g., Machinery, Vehicles, Computers)'
    },
    {
      fieldName: 'acquisitionDate',
      label: 'Acquisition Date',
      type: 'date',
      required: true,
      aliases: ['Acquisition Date', 'acquisition_date', 'Purchase Date', 'purchase_date', 'Date Acquired'],
      helpText: 'Date the asset was acquired or purchased'
    },
    {
      fieldName: 'originalCost',
      label: 'Original Cost',
      type: 'number',
      required: true,
      min: 0,
      aliases: ['Original Cost', 'original_cost', 'Cost', 'Purchase Price', 'purchase_price', 'Acquisition Cost'],
      helpText: 'Original purchase cost of the asset'
    },
    {
      fieldName: 'currentValue',
      label: 'Current Value',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Current Value', 'current_value', 'Book Value', 'book_value', 'Net Book Value'],
      helpText: 'Current book value after depreciation'
    },
    {
      fieldName: 'depreciationMethod',
      label: 'Depreciation Method',
      type: 'enum',
      required: false,
      enumValues: ['straight_line', 'declining_balance', 'double_declining', 'sum_of_years', 'macrs'],
      enumLabels: {
        straight_line: 'Straight Line',
        declining_balance: 'Declining Balance',
        double_declining: 'Double Declining Balance',
        sum_of_years: 'Sum of Years Digits',
        macrs: 'MACRS'
      },
      aliases: ['Depreciation Method', 'depreciation_method', 'Method', 'Depr Method', 'depr_method'],
      helpText: 'Method used to calculate depreciation'
    },
    {
      fieldName: 'usefulLifeYears',
      label: 'Useful Life Years',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Useful Life Years', 'useful_life_years', 'Useful Life', 'useful_life', 'Life', 'Years'],
      helpText: 'Expected useful life in years for depreciation'
    },
    {
      fieldName: 'salvageValue',
      label: 'Salvage Value',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Salvage Value', 'salvage_value', 'Residual Value', 'residual_value', 'Scrap Value'],
      helpText: 'Estimated residual value at end of useful life'
    },
    {
      fieldName: 'location',
      label: 'Location',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Location', 'Site', 'Facility', 'Plant', 'Building'],
      helpText: 'Physical location of the asset'
    },
    {
      fieldName: 'department',
      label: 'Department',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Department', 'Dept', 'Cost Center', 'cost_center', 'Division'],
      helpText: 'Department responsible for the asset'
    },
    {
      fieldName: 'serialNumber',
      label: 'Serial Number',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Serial Number', 'serial_number', 'Serial #', 'SN', 'Manufacturer Serial'],
      helpText: 'Manufacturer serial number or unique identifier'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'In Service', 'in_service'],
      helpText: 'Whether the asset is currently in service'
    }
  ]
};
