import type { ImportSchema } from './types';

export const bomImportSchema: ImportSchema = {
  entityType: 'bom',
  entityLabel: 'Bills of Material',
  module: 'manufacturing',
  migrationOrder: 9,
  apiEndpoint: '/api/manufacturing/boms/import',
  templateFilename: 'boms_import_template.csv',
  description: 'Import bill of materials (BOM) data in flat format - one row per BOM component relationship',
  fields: [
    {
      fieldName: 'bomNumber',
      label: 'BOM Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['BOM Number', 'bom_number', 'BOM #', 'BOM ID', 'bom_id', 'BOMNo'],
      helpText: 'Unique identifier for the bill of material'
    },
    {
      fieldName: 'bomName',
      label: 'BOM Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['BOM Name', 'bom_name', 'Name', 'Description', 'BOM Description'],
      helpText: 'Descriptive name of the BOM'
    },
    {
      fieldName: 'finishedItemNumber',
      label: 'Finished Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Finished Item Number', 'finished_item_number', 'Parent Item', 'parent_item', 'Finished Good', 'FG Number'],
      helpText: 'Item number of the finished good this BOM produces'
    },
    {
      fieldName: 'componentItemNumber',
      label: 'Component Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Component Item Number', 'component_item_number', 'Component', 'Child Item', 'child_item', 'Material'],
      helpText: 'Item number of the component or material used'
    },
    {
      fieldName: 'quantityRequired',
      label: 'Quantity Required',
      type: 'number',
      required: true,
      min: 0,
      aliases: ['Quantity Required', 'quantity_required', 'Quantity', 'Qty', 'Usage', 'Qty Per'],
      helpText: 'Quantity of component required per unit of finished item'
    },
    {
      fieldName: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: 'string',
      required: false,
      maxLength: 20,
      defaultValue: 'EA',
      aliases: ['Unit of Measure', 'unit_of_measure', 'UOM', 'Unit', 'U/M'],
      helpText: 'Unit of measure for the component quantity'
    },
    {
      fieldName: 'scrapPercent',
      label: 'Scrap Percent',
      type: 'number',
      required: false,
      min: 0,
      max: 100,
      aliases: ['Scrap Percent', 'scrap_percent', 'Scrap %', 'Scrap', 'Waste Percent'],
      helpText: 'Expected scrap or waste percentage for this component'
    },
    {
      fieldName: 'bomType',
      label: 'BOM Type',
      type: 'enum',
      required: false,
      defaultValue: 'standard',
      enumValues: ['standard', 'phantom', 'engineering', 'manufacturing'],
      enumLabels: {
        standard: 'Standard',
        phantom: 'Phantom',
        engineering: 'Engineering',
        manufacturing: 'Manufacturing'
      },
      aliases: ['BOM Type', 'bom_type', 'Type', 'Category'],
      helpText: 'Type of BOM (standard, phantom, engineering, or manufacturing)'
    },
    {
      fieldName: 'version',
      label: 'Version',
      type: 'string',
      required: false,
      maxLength: 20,
      defaultValue: '1.0',
      aliases: ['Version', 'Revision', 'Rev', 'BOM Version', 'bom_version'],
      helpText: 'Version or revision number of the BOM'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether this BOM version is currently active'
    }
  ]
};
