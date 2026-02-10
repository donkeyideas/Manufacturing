import type { ImportSchema } from './types';

export const workOrderImportSchema: ImportSchema = {
  entityType: 'work-order',
  entityLabel: 'Work Orders',
  module: 'manufacturing',
  migrationOrder: 13,
  apiEndpoint: '/api/manufacturing/work-orders/import',
  templateFilename: 'work_orders_import_template.csv',
  description: 'Import manufacturing work orders for production scheduling and tracking',
  fields: [
    {
      fieldName: 'workOrderNumber',
      label: 'Work Order Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Work Order Number', 'work_order_number', 'WO Number', 'wo_number', 'Work Order #', 'WO #', 'Job Number'],
      helpText: 'Unique work order number'
    },
    {
      fieldName: 'finishedItemNumber',
      label: 'Finished Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Finished Item Number', 'finished_item_number', 'Item Number', 'item_number', 'Part Number', 'SKU', 'FG Number'],
      helpText: 'Item number to be produced'
    },
    {
      fieldName: 'quantityOrdered',
      label: 'Quantity Ordered',
      type: 'number',
      required: true,
      min: 0,
      aliases: ['Quantity Ordered', 'quantity_ordered', 'Quantity', 'Qty', 'Order Qty', 'order_qty', 'Production Qty'],
      helpText: 'Quantity to be produced'
    },
    {
      fieldName: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: false,
      aliases: ['Start Date', 'start_date', 'Planned Start', 'planned_start', 'Begin Date'],
      helpText: 'Planned or actual start date for production'
    },
    {
      fieldName: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: false,
      aliases: ['Due Date', 'due_date', 'Completion Date', 'completion_date', 'End Date', 'Finish Date'],
      helpText: 'Date the work order is due to be completed'
    },
    {
      fieldName: 'status',
      label: 'Status',
      type: 'enum',
      required: false,
      enumValues: ['planned', 'released', 'in_progress', 'completed', 'closed'],
      enumLabels: {
        planned: 'Planned',
        released: 'Released',
        in_progress: 'In Progress',
        completed: 'Completed',
        closed: 'Closed'
      },
      aliases: ['Status', 'WO Status', 'wo_status', 'State', 'Order Status'],
      helpText: 'Current status of the work order'
    },
    {
      fieldName: 'priority',
      label: 'Priority',
      type: 'enum',
      required: false,
      defaultValue: 'normal',
      enumValues: ['low', 'normal', 'high', 'urgent'],
      enumLabels: {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent'
      },
      aliases: ['Priority', 'Urgency', 'Importance'],
      helpText: 'Priority level for scheduling'
    },
    {
      fieldName: 'bomNumber',
      label: 'BOM Number',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['BOM Number', 'bom_number', 'BOM #', 'BOM ID', 'bom_id', 'Bill of Material'],
      helpText: 'BOM to use for this work order (if different from default)'
    },
    {
      fieldName: 'notes',
      label: 'Notes',
      type: 'string',
      required: false,
      maxLength: 1000,
      aliases: ['Notes', 'Comments', 'Instructions', 'Description', 'Remarks'],
      helpText: 'Additional notes or instructions for the work order'
    }
  ]
};
