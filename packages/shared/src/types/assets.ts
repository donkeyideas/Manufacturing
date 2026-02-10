import type { UUID, ISODate, AuditFields } from './common';

// ─── Asset Categories ───

export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'units_of_production' | 'macrs' | 'none';

export interface AssetCategory extends AuditFields {
  id: UUID;
  tenantId: UUID;
  categoryCode: string;
  categoryName: string;
  parentCategoryId?: UUID;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears?: number;
  depreciationRate?: number;
  isActive: boolean;
}

// ─── Fixed Assets ───

export type AssetStatus = 'active' | 'disposed' | 'sold' | 'retired' | 'under_maintenance';

export interface FixedAsset extends AuditFields {
  id: UUID;
  tenantId: UUID;
  assetNumber: string;
  assetName: string;
  assetCategoryId: UUID;
  categoryName?: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate: ISODate;
  purchaseCost: number;
  currentValue: number;
  accumulatedDepreciation: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  location?: string;
  department?: string;
  status: AssetStatus;
  isDepreciable: boolean;
  lastDepreciationDate?: ISODate;
  nextDepreciationDate?: ISODate;
  warrantyExpiryDate?: ISODate;
  notes?: string;
}

// ─── Depreciation ───

export interface DepreciationSchedule {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  assetNumber?: string;
  assetName?: string;
  depreciationDate: ISODate;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
  isPosted: boolean;
}

// ─── Asset Disposal ───

export type DisposalType = 'sold' | 'scrapped' | 'donated' | 'lost' | 'stolen';

export interface AssetDisposal extends AuditFields {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  disposalNumber: string;
  disposalDate: ISODate;
  disposalType: DisposalType;
  disposalAmount: number;
  bookValueAtDisposal: number;
  gainLossAmount: number;
  notes?: string;
}

// ─── Maintenance ───

export type MaintenanceType = 'preventive' | 'corrective' | 'inspection';

export interface MaintenanceRecord extends AuditFields {
  id: UUID;
  tenantId: UUID;
  assetId: UUID;
  assetNumber?: string;
  assetName?: string;
  maintenanceType: MaintenanceType;
  maintenanceDate: ISODate;
  description: string;
  cost: number;
  performedBy?: string;
  nextMaintenanceDate?: ISODate;
  notes?: string;
}
