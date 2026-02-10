import type { UUID, ISODate, AuditFields, Address } from './common';

// ─── Customers ───

export interface Customer extends AuditFields {
  id: UUID;
  tenantId: UUID;
  customerNumber: string;
  customerName: string;
  legalName?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  isActive: boolean;
  notes?: string;
}

// ─── Sales Quotes ───

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface SalesQuote extends AuditFields {
  id: UUID;
  tenantId: UUID;
  quoteNumber: string;
  quoteDate: ISODate;
  expirationDate?: ISODate;
  customerId: UUID;
  customerName?: string;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  notes?: string;
  convertedToSO: boolean;
  salesOrderId?: UUID;
  lines: SalesQuoteLine[];
}

export interface SalesQuoteLine {
  id: UUID;
  quoteId: UUID;
  lineNumber: number;
  itemId?: UUID;
  itemDescription: string;
  quantityQuoted: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
  unitOfMeasure: string;
}

// ─── Sales Orders ───

export type SalesOrderStatus =
  | 'draft' | 'pending_approval' | 'approved' | 'in_progress'
  | 'partially_shipped' | 'shipped' | 'delivered'
  | 'cancelled' | 'closed';

export type SalesOrderType = 'standard' | 'rush' | 'repeat' | 'sample';

export interface SalesOrder extends AuditFields {
  id: UUID;
  tenantId: UUID;
  soNumber: string;
  soDate: ISODate;
  customerId: UUID;
  customerName?: string;
  customerPONumber?: string;
  status: SalesOrderStatus;
  orderType: SalesOrderType;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  requestedShipDate?: ISODate;
  promisedShipDate?: ISODate;
  actualShipDate?: ISODate;
  quoteId?: UUID;
  notes?: string;
  lines: SalesOrderLine[];
}

export interface SalesOrderLine {
  id: UUID;
  soId: UUID;
  lineNumber: number;
  itemId?: UUID;
  itemNumber?: string;
  itemDescription: string;
  quantityOrdered: number;
  quantityShipped: number;
  quantityInvoiced: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
  unitOfMeasure: string;
  warehouseId?: UUID;
  status: 'pending' | 'allocated' | 'picked' | 'shipped' | 'delivered' | 'cancelled';
}

// ─── Customer Invoices ───

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface CustomerInvoice extends AuditFields {
  id: UUID;
  tenantId: UUID;
  invoiceNumber: string;
  customerId: UUID;
  customerName?: string;
  orderId?: UUID;
  invoiceDate: ISODate;
  dueDate: ISODate;
  invoiceAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number;
  currency: string;
  status: InvoiceStatus;
  description?: string;
  notes?: string;
}

// ─── Sales Opportunities ───

export type OpportunityStage =
  | 'prospecting' | 'qualification' | 'proposal'
  | 'negotiation' | 'closed_won' | 'closed_lost';

export interface SalesOpportunity extends AuditFields {
  id: UUID;
  tenantId: UUID;
  opportunityNumber: string;
  opportunityName: string;
  customerId?: UUID;
  customerName?: string;
  stage: OpportunityStage;
  probability: number;
  estimatedValue: number;
  estimatedCloseDate?: ISODate;
  source?: string;
  assignedTo?: UUID;
  notes?: string;
}

// ─── Sales Shipments ───

export type ShipmentStatus = 'pending' | 'picked' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'exception';

export interface SalesShipment extends AuditFields {
  id: UUID;
  tenantId: UUID;
  shipmentNumber: string;
  shipmentDate: ISODate;
  soId: UUID;
  customerId: UUID;
  customerName?: string;
  carrierName?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  status: ShipmentStatus;
  shippedDate?: ISODate;
  deliveredDate?: ISODate;
  shippingCost?: number;
  lines: SalesShipmentLine[];
}

export interface SalesShipmentLine {
  id: UUID;
  shipmentId: UUID;
  soLineId: UUID;
  itemId: UUID;
  itemNumber?: string;
  quantityShipped: number;
}
