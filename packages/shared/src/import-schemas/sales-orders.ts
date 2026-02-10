import type { ImportSchema } from './types';

export const salesOrderImportSchema: ImportSchema = {
  entityType: 'sales-order',
  entityLabel: 'Sales Orders',
  module: 'sales',
  migrationOrder: 11,
  apiEndpoint: '/api/sales/orders/import',
  templateFilename: 'sales_orders_import_template.csv',
  description: 'Import sales orders with customer and line item details',
  fields: [
    {
      fieldName: 'soNumber',
      label: 'SO Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['SO Number', 'so_number', 'Sales Order Number', 'sales_order_number', 'Order Number', 'order_number', 'SO #'],
      helpText: 'Unique sales order number'
    },
    {
      fieldName: 'soDate',
      label: 'SO Date',
      type: 'date',
      required: true,
      aliases: ['SO Date', 'so_date', 'Order Date', 'order_date', 'Date', 'Sales Order Date'],
      helpText: 'Date the sales order was created'
    },
    {
      fieldName: 'customerNumber',
      label: 'Customer Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Customer Number', 'customer_number', 'Customer #', 'Customer ID', 'customer_id', 'Sold To'],
      helpText: 'Customer number from customer master'
    },
    {
      fieldName: 'itemNumber',
      label: 'Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Item Number', 'item_number', 'Item #', 'Part Number', 'part_number', 'SKU', 'Product'],
      helpText: 'Item number being ordered'
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
      aliases: ['Unit Price', 'unit_price', 'Price', 'Selling Price', 'selling_price', 'List Price'],
      helpText: 'Price per unit for this line item'
    },
    {
      fieldName: 'status',
      label: 'Status',
      type: 'enum',
      required: false,
      enumValues: ['draft', 'confirmed', 'in_production', 'shipped', 'delivered', 'closed'],
      enumLabels: {
        draft: 'Draft',
        confirmed: 'Confirmed',
        in_production: 'In Production',
        shipped: 'Shipped',
        delivered: 'Delivered',
        closed: 'Closed'
      },
      aliases: ['Status', 'Order Status', 'order_status', 'State'],
      helpText: 'Current status of the sales order'
    },
    {
      fieldName: 'currency',
      label: 'Currency',
      type: 'string',
      required: false,
      maxLength: 10,
      defaultValue: 'USD',
      aliases: ['Currency', 'Currency Code', 'currency_code', 'CCY'],
      helpText: 'Currency code for the order (e.g., USD, EUR, GBP)'
    },
    {
      fieldName: 'requestedShipDate',
      label: 'Requested Ship Date',
      type: 'date',
      required: false,
      aliases: ['Requested Ship Date', 'requested_ship_date', 'Ship Date', 'ship_date', 'Delivery Date', 'Due Date'],
      helpText: 'Date customer requested shipment'
    }
  ]
};
