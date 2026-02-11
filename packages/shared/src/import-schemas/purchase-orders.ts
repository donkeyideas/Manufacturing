import type { ImportSchema } from './types';

export const purchaseOrderImportSchema: ImportSchema = {
  entityType: 'purchase-order',
  entityLabel: 'Purchase Orders',
  module: 'procurement',
  migrationOrder: 12,
  apiEndpoint: '/api/procurement/orders/import',
  templateFilename: 'purchase_orders_import_template.csv',
  description: 'Import purchase orders with vendor and line item details',
  dependencies: ['vendor', 'item'],
  fields: [
    {
      fieldName: 'poNumber',
      label: 'PO Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['PO Number', 'po_number', 'Purchase Order Number', 'purchase_order_number', 'Order Number', 'order_number', 'PO #'],
      helpText: 'Unique purchase order number'
    },
    {
      fieldName: 'poDate',
      label: 'PO Date',
      type: 'date',
      required: true,
      aliases: ['PO Date', 'po_date', 'Order Date', 'order_date', 'Date', 'Purchase Order Date'],
      helpText: 'Date the purchase order was created'
    },
    {
      fieldName: 'vendorNumber',
      label: 'Vendor Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Vendor Number', 'vendor_number', 'Vendor #', 'Vendor ID', 'vendor_id', 'Supplier Number', 'supplier_number'],
      helpText: 'Vendor number from vendor master'
    },
    {
      fieldName: 'itemNumber',
      label: 'Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Item Number', 'item_number', 'Item #', 'Part Number', 'part_number', 'SKU', 'Material'],
      helpText: 'Item number being purchased'
    },
    {
      fieldName: 'quantityOrdered',
      label: 'Quantity Ordered',
      type: 'number',
      required: true,
      min: 0,
      aliases: ['Quantity Ordered', 'quantity_ordered', 'Quantity', 'Qty', 'Ordered Qty', 'ordered_qty'],
      helpText: 'Quantity of items ordered'
    },
    {
      fieldName: 'unitPrice',
      label: 'Unit Price',
      type: 'number',
      required: true,
      min: 0,
      aliases: ['Unit Price', 'unit_price', 'Price', 'Cost', 'Unit Cost', 'unit_cost'],
      helpText: 'Cost per unit for this line item'
    },
    {
      fieldName: 'status',
      label: 'Status',
      type: 'enum',
      required: false,
      enumValues: ['draft', 'pending_approval', 'approved', 'sent', 'received', 'closed'],
      enumLabels: {
        draft: 'Draft',
        pending_approval: 'Pending Approval',
        approved: 'Approved',
        sent: 'Sent',
        received: 'Received',
        closed: 'Closed'
      },
      aliases: ['Status', 'Order Status', 'order_status', 'State', 'PO Status'],
      helpText: 'Current status of the purchase order'
    },
    {
      fieldName: 'deliveryDate',
      label: 'Delivery Date',
      type: 'date',
      required: false,
      aliases: ['Delivery Date', 'delivery_date', 'Due Date', 'due_date', 'Expected Date', 'Receipt Date'],
      helpText: 'Expected delivery or receipt date'
    }
  ]
};
