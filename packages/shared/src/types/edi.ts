import type { UUID, ISODate, ISOTimestamp } from './common';

// ─── EDI Enums ───

export type EdiDocumentType = '850' | '855' | '810' | '856' | '997' | 'custom';
export type EdiDirection = 'inbound' | 'outbound';
export type EdiTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'acknowledged';
export type EdiFormat = 'csv' | 'xml' | 'json' | 'x12';
export type EdiPartnerStatus = 'active' | 'inactive' | 'testing' | 'suspended';
export type EdiCommMethod = 'manual' | 'api' | 'sftp' | 'as2' | 'email';
export type EdiPartnerType = 'customer' | 'vendor' | 'both';

// ─── Trading Partners ───

export interface EdiTradingPartner {
  id: UUID;
  tenantId: UUID;
  partnerCode: string;
  partnerName: string;
  partnerType: EdiPartnerType;
  customerId?: UUID | null;
  vendorId?: UUID | null;
  communicationMethod: EdiCommMethod;
  defaultFormat: EdiFormat;
  status: EdiPartnerStatus;
  // X12 identifiers
  isaId?: string | null;
  gsId?: string | null;
  // AS2 config
  as2Id?: string | null;
  as2Url?: string | null;
  partnerCertificate?: string | null;
  encryptionAlgorithm?: string | null;
  signatureAlgorithm?: string | null;
  // SFTP config
  sftpHost?: string | null;
  sftpPort?: number | null;
  sftpUsername?: string | null;
  sftpRemoteDir?: string | null;
  sftpPollSchedule?: string | null;
  // Contact info
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── EDI Transactions ───

export interface EdiTransaction {
  id: UUID;
  tenantId: UUID;
  transactionNumber: string;
  partnerId: UUID;
  partnerName?: string;
  documentType: EdiDocumentType;
  direction: EdiDirection;
  format: EdiFormat;
  status: EdiTransactionStatus;
  salesOrderId?: UUID | null;
  purchaseOrderId?: UUID | null;
  rawContent?: string | null;
  parsedContent?: string | null;
  errorMessage?: string | null;
  errorDetails?: string | null;
  acknowledgmentId?: UUID | null;
  as2MessageId?: string | null;
  controlNumber?: string | null;
  documentDate?: ISODate | null;
  processedAt?: ISOTimestamp | null;
  processedBy?: UUID | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Document Maps ───

export interface EdiFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'number' | 'date' | 'boolean';
  defaultValue?: string;
}

export interface EdiDocumentMap {
  id: UUID;
  tenantId: UUID;
  partnerId?: UUID | null;
  documentType: EdiDocumentType;
  direction: EdiDirection;
  mapName: string;
  mappingRules: EdiFieldMapping[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── EDI Settings ───

export interface EdiSettings {
  id: UUID;
  tenantId: UUID;
  companyIsaId?: string | null;
  companyGsId?: string | null;
  companyAs2Id?: string | null;
  companyCertificate?: string | null;
  companyPrivateKey?: string | null;
  autoAcknowledge997: boolean;
  autoCreateSalesOrders: boolean;
  autoGenerateOnApproval: boolean;
  defaultFormat: EdiFormat;
  retentionDays: number;
  sftpPollingEnabled: boolean;
  sftpPollingIntervalMinutes: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── EDI Overview KPIs ───

export interface EdiOverview {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  activeTradingPartners: number;
  transactionsToday: number;
  successRate: number;
}

// ─── AS2 Types ───

export interface As2Config {
  as2Id: string;
  as2Url: string;
  certificate: string;
  privateKey?: string;
  encryptionAlgorithm: string;
  signatureAlgorithm: string;
}

export interface As2MessageHeaders {
  'AS2-Version': string;
  'AS2-From': string;
  'AS2-To': string;
  'Message-ID': string;
  'Content-Type': string;
  'Disposition-Notification-To'?: string;
  'Receipt-Delivery-Option'?: string;
}

export interface MdnResult {
  messageId: string;
  originalMessageId: string;
  disposition: 'processed' | 'failed';
  mic?: string;
  errorMessage?: string;
}

// ─── Constants ───

export const EDI_DOC_TYPE_LABELS: Record<EdiDocumentType, string> = {
  '850': 'Purchase Order',
  '855': 'PO Acknowledgment',
  '810': 'Invoice',
  '856': 'Advance Ship Notice',
  '997': 'Functional Acknowledgment',
  'custom': 'Custom Document',
};

export const EDI_STATUS_COLORS: Record<EdiTransactionStatus, string> = {
  pending: 'yellow',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
  acknowledged: 'purple',
};

export const EDI_DIRECTION_LABELS: Record<EdiDirection, string> = {
  inbound: 'Inbound',
  outbound: 'Outbound',
};

export const EDI_FORMAT_LABELS: Record<EdiFormat, string> = {
  csv: 'CSV',
  xml: 'XML',
  json: 'JSON',
  x12: 'X12 (ANSI)',
};

export const EDI_COMM_METHOD_LABELS: Record<EdiCommMethod, string> = {
  manual: 'Manual Upload',
  api: 'API',
  sftp: 'SFTP',
  as2: 'AS2',
  email: 'Email',
};
