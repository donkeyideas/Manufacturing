import type { UUID, ISODate, ISOTimestamp, AuditFields, Address } from './common';

// ─── Vendors ───

export interface Vendor extends AuditFields {
  id: UUID;
  tenantId: UUID;
  vendorNumber: string;
  vendorName: string;
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
  is1099Eligible: boolean;
  notes?: string;
}

// ─── Purchase Requisitions ───

export type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted' | 'cancelled';

export interface PurchaseRequisition extends AuditFields {
  id: UUID;
  tenantId: UUID;
  requisitionNumber: string;
  requisitionDate: ISODate;
  requestedBy: UUID;
  department?: string;
  status: RequisitionStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  totalEstimatedCost: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: UUID;
  approvedAt?: ISOTimestamp;
  convertedToPO: boolean;
  purchaseOrderId?: UUID;
  notes?: string;
  lines: PurchaseRequisitionLine[];
}

export interface PurchaseRequisitionLine {
  id: UUID;
  requisitionId: UUID;
  lineNumber: number;
  itemId?: UUID;
  itemDescription: string;
  quantityRequested: number;
  unitOfMeasure: string;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  requiredDate?: ISODate;
  warehouseId?: UUID;
}

// ─── Purchase Orders ───

export type POStatus =
  | 'draft' | 'pending_approval' | 'approved' | 'sent'
  | 'partially_received' | 'received' | 'closed' | 'cancelled';

export type POType = 'standard' | 'blanket' | 'contract' | 'drop_ship';

export interface PurchaseOrder extends AuditFields {
  id: UUID;
  tenantId: UUID;
  poNumber: string;
  poDate: ISODate;
  vendorId: UUID;
  vendorName?: string;
  status: POStatus;
  orderType: POType;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  deliveryDate?: ISODate;
  approvedBy?: UUID;
  approvedAt?: ISOTimestamp;
  notes?: string;
  lines: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: UUID;
  poId: UUID;
  lineNumber: number;
  itemId?: UUID;
  itemNumber?: string;
  itemDescription: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityInvoiced: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
  unitOfMeasure: string;
  requiredDate?: ISODate;
  warehouseId?: UUID;
}

// ─── Vendor Invoices ───

export type VendorInvoiceStatus = 'draft' | 'pending_approval' | 'approved' | 'paid' | 'partially_paid' | 'cancelled';

export interface VendorInvoice extends AuditFields {
  id: UUID;
  tenantId: UUID;
  invoiceNumber: string;
  vendorId: UUID;
  vendorName?: string;
  poId?: UUID;
  invoiceDate: ISODate;
  dueDate: ISODate;
  invoiceAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number;
  currency: string;
  status: VendorInvoiceStatus;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  description?: string;
  notes?: string;
}

// ─── Goods Receipts ───

export type GoodsReceiptStatus = 'pending' | 'inspected' | 'accepted' | 'rejected' | 'partial';

export interface GoodsReceipt extends AuditFields {
  id: UUID;
  tenantId: UUID;
  receiptNumber: string;
  receiptDate: ISODate;
  poId?: UUID;
  vendorId: UUID;
  vendorName?: string;
  warehouseId: UUID;
  status: GoodsReceiptStatus;
  inspectionRequired: boolean;
  notes?: string;
  lines: GoodsReceiptLine[];
}

export interface GoodsReceiptLine {
  id: UUID;
  receiptId: UUID;
  poLineId?: UUID;
  itemId: UUID;
  itemNumber?: string;
  lineNumber: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unitCost: number;
  totalCost: number;
  locationId?: UUID;
  lotNumber?: string;
  serialNumber?: string;
}
