import type { Request, Response } from 'express';
import { asyncHandler } from './asyncHandler.js';
import type { AuthenticatedRequest } from './auth.js';
import type { ImportSchema, ImportValidationError } from '@erp/shared';
import { validateRow, coerceRow } from '@erp/shared';

type InsertFunction = (rows: Record<string, unknown>[], tenantId: string) => Promise<void>;

/**
 * Create a generic import handler for bulk data imports
 *
 * @param schema - The import schema defining field validation rules
 * @param insertFn - Async function to insert validated rows into the database
 * @returns Express route handler for POST /import endpoints
 */
export function createImportHandler(schema: ImportSchema, insertFn: InsertFunction) {
  return asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const { rows } = req.body;

    // Validate request body
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ success: false, error: 'No rows provided' });
      return;
    }

    if (rows.length > 500) {
      res.status(400).json({ success: false, error: 'Maximum 500 rows per batch' });
      return;
    }

    const errors: ImportValidationError[] = [];
    const validRows: Record<string, unknown>[] = [];

    // Validate and coerce each row
    for (let i = 0; i < rows.length; i++) {
      const coerced = coerceRow(rows[i], schema);
      const rowErrors = validateRow(coerced, schema, i + 2); // +2 for header row + 0-index
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRows.push(coerced);
      }
    }

    // Insert valid rows into database
    if (validRows.length > 0) {
      try {
        await insertFn(validRows, user!.tenantId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
          success: false,
          error: `Database insert failed: ${message}`,
          data: { successCount: 0, errorCount: rows.length, errors }
        });
        return;
      }
    }

    // Return results
    res.json({
      success: true,
      data: {
        successCount: validRows.length,
        errorCount: errors.length,
        errors: errors.slice(0, 100), // Cap at 100 errors in response
      }
    });
  });
}
