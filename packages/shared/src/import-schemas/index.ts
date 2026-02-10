// Export all types
export * from './types';

// Export validation utilities
export * from './validate';

// Export individual schemas
export * from './items';
export * from './customers';
export * from './vendors';
export * from './employees';
export * from './accounts';
export * from './fixed-assets';
export * from './warehouses';
export * from './work-centers';
export * from './boms';
export * from './routings';
export * from './sales-orders';
export * from './purchase-orders';
export * from './work-orders';
export * from './journal-entries';

// Import schemas for aggregation
import { itemImportSchema } from './items';
import { customerImportSchema } from './customers';
import { vendorImportSchema } from './vendors';
import { employeeImportSchema } from './employees';
import { accountImportSchema } from './accounts';
import { fixedAssetImportSchema } from './fixed-assets';
import { warehouseImportSchema } from './warehouses';
import { workCenterImportSchema } from './work-centers';
import { bomImportSchema } from './boms';
import { routingImportSchema } from './routings';
import { salesOrderImportSchema } from './sales-orders';
import { purchaseOrderImportSchema } from './purchase-orders';
import { workOrderImportSchema } from './work-orders';
import { journalEntryImportSchema } from './journal-entries';

import type { ImportSchema } from './types';

/**
 * All import schemas sorted by migration order
 */
export const ALL_IMPORT_SCHEMAS: ImportSchema[] = [
  itemImportSchema,
  customerImportSchema,
  vendorImportSchema,
  employeeImportSchema,
  accountImportSchema,
  fixedAssetImportSchema,
  warehouseImportSchema,
  workCenterImportSchema,
  bomImportSchema,
  routingImportSchema,
  salesOrderImportSchema,
  purchaseOrderImportSchema,
  workOrderImportSchema,
  journalEntryImportSchema
].sort((a, b) => a.migrationOrder - b.migrationOrder);

/**
 * Get a schema by entity type
 */
export function getSchemaByEntityType(entityType: string): ImportSchema | undefined {
  return ALL_IMPORT_SCHEMAS.find(schema => schema.entityType === entityType);
}

/**
 * Get a schema by module
 */
export function getSchemasByModule(module: string): ImportSchema[] {
  return ALL_IMPORT_SCHEMAS.filter(schema => schema.module === module);
}
