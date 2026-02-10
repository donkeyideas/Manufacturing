import type { UUID, ISODate, ISOTimestamp, AuditFields } from './common';

// ─── Items ───

export type ItemType = 'raw_material' | 'component' | 'finished_good' | 'subassembly' | 'supplies';
export type CostMethod = 'fifo' | 'lifo' | 'average' | 'standard' | 'actual';
export type ABCClass = 'A' | 'B' | 'C';

export interface Item extends AuditFields {
  id: UUID;
  tenantId: UUID;
  itemNumber: string;
  itemName: string;
  description?: string;
  itemType: ItemType;
  itemCategory?: string;
  unitOfMeasure: string;
  isActive: boolean;
  isSerialized: boolean;
  isLotTracked: boolean;
  costMethod: CostMethod;
  standardCost: number;
  weight?: number;
  // Inventory planning
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  safetyStock?: number;
  leadTimeDays?: number;
  abcClassification?: ABCClass;
}

// ─── Warehouses ───

export interface Warehouse extends AuditFields {
  id: UUID;
  tenantId: UUID;
  warehouseCode: string;
  warehouseName: string;
  city?: string;
  state?: string;
  country?: string;
  isActive: boolean;
  isDefault: boolean;
}

export type LocationType = 'bin' | 'pallet' | 'rack' | 'floor';

export interface WarehouseLocation extends AuditFields {
  id: UUID;
  tenantId: UUID;
  warehouseId: UUID;
  locationCode: string;
  locationName: string;
  locationType: LocationType;
  zone?: string;
  aisle?: string;
  isActive: boolean;
}

// ─── Inventory On Hand ───

export interface InventoryOnHand {
  id: UUID;
  tenantId: UUID;
  itemId: UUID;
  warehouseId: UUID;
  locationId?: UUID;
  quantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  reservedQuantity: number;
  unitCost: number;
  totalCost: number;
  // Denormalized for display
  itemNumber?: string;
  itemName?: string;
  warehouseName?: string;
}

// ─── Inventory Transactions ───

export type TransactionType = 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'count' | 'return';
export type ReferenceType = 'po' | 'wo' | 'so' | 'je' | 'manual';

export interface InventoryTransaction extends AuditFields {
  id: UUID;
  tenantId: UUID;
  transactionNumber: string;
  transactionType: TransactionType;
  transactionDate: ISOTimestamp;
  itemId: UUID;
  warehouseId: UUID;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType?: ReferenceType;
  referenceId?: UUID;
  referenceNumber?: string;
  lotNumber?: string;
  serialNumber?: string;
  reasonCode?: string;
  notes?: string;
  // Denormalized
  itemNumber?: string;
  itemName?: string;
}

// ─── Cycle Counts ───

export type CycleCountStatus = 'pending' | 'in_progress' | 'completed' | 'adjusted';
export type CycleCountType = 'full' | 'partial' | 'abc' | 'random';

export interface CycleCount extends AuditFields {
  id: UUID;
  tenantId: UUID;
  countNumber: string;
  warehouseId: UUID;
  countDate: ISODate;
  countType: CycleCountType;
  status: CycleCountStatus;
  notes?: string;
  lines: CycleCountLine[];
}

export interface CycleCountLine {
  id: UUID;
  cycleCountId: UUID;
  itemId: UUID;
  locationId?: UUID;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  varianceCost: number;
  varianceReason?: string;
  isAdjusted: boolean;
  // Denormalized
  itemNumber?: string;
  itemName?: string;
}

// ─── Demand Planning ───

export interface DemandForecast {
  id: UUID;
  tenantId: UUID;
  itemId: UUID;
  warehouseId?: UUID;
  forecastDate: ISODate;
  forecastQuantity: number;
  confidenceLevel: number;
  forecastMethod: string;
  itemNumber?: string;
  itemName?: string;
}
