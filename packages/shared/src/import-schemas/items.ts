import type { ImportSchema } from './types';

export const itemImportSchema: ImportSchema = {
  entityType: 'item',
  entityLabel: 'Inventory Items',
  module: 'inventory',
  migrationOrder: 1,
  apiEndpoint: '/api/inventory/items/import',
  templateFilename: 'items_import_template.csv',
  description: 'Import inventory items including raw materials, components, finished goods, and supplies',
  fields: [
    {
      fieldName: 'itemNumber',
      label: 'Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Item Number', 'item_number', 'Item #', 'SKU', 'Part Number', 'part_number', 'ItemNo'],
      helpText: 'Unique identifier for the item'
    },
    {
      fieldName: 'itemName',
      label: 'Item Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Item Name', 'item_name', 'Name', 'Description', 'Part Name', 'part_name'],
      helpText: 'Full descriptive name of the item'
    },
    {
      fieldName: 'itemType',
      label: 'Item Type',
      type: 'enum',
      required: true,
      enumValues: ['raw_material', 'component', 'finished_good', 'subassembly', 'supplies'],
      enumLabels: {
        raw_material: 'Raw Material',
        component: 'Component',
        finished_good: 'Finished Good',
        subassembly: 'Subassembly',
        supplies: 'Supplies'
      },
      aliases: ['Item Type', 'item_type', 'Type', 'Category', 'ItemCategory'],
      helpText: 'Classification of the item in the manufacturing process'
    },
    {
      fieldName: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: 'string',
      required: false,
      maxLength: 20,
      defaultValue: 'EA',
      aliases: ['Unit of Measure', 'unit_of_measure', 'UOM', 'Unit', 'U/M'],
      helpText: 'Unit for tracking quantity (e.g., EA, LB, FT, GAL)'
    },
    {
      fieldName: 'standardCost',
      label: 'Standard Cost',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Standard Cost', 'standard_cost', 'Cost', 'Unit Cost', 'unit_cost'],
      helpText: 'Standard cost per unit for costing and valuation'
    },
    {
      fieldName: 'sellingPrice',
      label: 'Selling Price',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Selling Price', 'selling_price', 'Price', 'Unit Price', 'unit_price', 'List Price'],
      helpText: 'Default selling price per unit'
    },
    {
      fieldName: 'reorderPoint',
      label: 'Reorder Point',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Reorder Point', 'reorder_point', 'Min Quantity', 'min_quantity', 'Minimum'],
      helpText: 'Quantity level that triggers replenishment'
    },
    {
      fieldName: 'reorderQuantity',
      label: 'Reorder Quantity',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Reorder Quantity', 'reorder_quantity', 'Order Quantity', 'order_quantity', 'EOQ'],
      helpText: 'Standard quantity to order when replenishing'
    },
    {
      fieldName: 'description',
      label: 'Description',
      type: 'string',
      required: false,
      maxLength: 1000,
      aliases: ['Description', 'Notes', 'Comments', 'Details'],
      helpText: 'Additional details about the item'
    },
    {
      fieldName: 'abcClassification',
      label: 'ABC Classification',
      type: 'enum',
      required: false,
      enumValues: ['A', 'B', 'C'],
      enumLabels: { A: 'A - High Value', B: 'B - Medium Value', C: 'C - Low Value' },
      aliases: ['ABC Classification', 'abc_classification', 'ABC', 'Class'],
      helpText: 'ABC analysis classification for inventory management'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the item is currently active in the system'
    },
    {
      fieldName: 'isSerialized',
      label: 'Is Serialized',
      type: 'boolean',
      required: false,
      defaultValue: false,
      aliases: ['Is Serialized', 'is_serialized', 'Serialized', 'Serial Tracking'],
      helpText: 'Track individual units with unique serial numbers'
    },
    {
      fieldName: 'isLotTracked',
      label: 'Is Lot Tracked',
      type: 'boolean',
      required: false,
      defaultValue: false,
      aliases: ['Is Lot Tracked', 'is_lot_tracked', 'Lot Tracked', 'Lot Tracking', 'Batch Tracking'],
      helpText: 'Track inventory by lot or batch numbers'
    },
    {
      fieldName: 'leadTimeDays',
      label: 'Lead Time Days',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Lead Time Days', 'lead_time_days', 'Lead Time', 'lead_time', 'Days'],
      helpText: 'Standard procurement or production lead time in days'
    }
  ]
};
