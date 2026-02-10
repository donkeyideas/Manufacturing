import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import type { ImportSchema, ImportValidationError } from '@erp/shared';

interface ImportResponse {
  success: number;
  errors: ImportValidationError[];
}

/**
 * Generic import mutation that works in both demo and live mode.
 * Demo mode: returns data as-is (caller adds to local state).
 * Live mode: batches data and POSTs to backend.
 */
export function useImportData(schema: ImportSchema) {
  const { isDemo } = useAppMode();
  const queryClient = useQueryClient();

  return useMutation<ImportResponse, Error, Record<string, unknown>[]>({
    mutationFn: async (rows) => {
      if (isDemo) {
        // In demo mode, just return success — page component
        // adds data to local state via its own onImport callback
        return { success: rows.length, errors: [] };
      }

      // Live mode: batch POST
      const BATCH_SIZE = 100;
      let totalSuccess = 0;
      const allErrors: ImportValidationError[] = [];

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { data } = await apiClient.post(schema.apiEndpoint, {
          rows: batch,
        });
        totalSuccess += data.data.successCount;
        allErrors.push(...(data.data.errors || []));
      }

      return { success: totalSuccess, errors: allErrors };
    },
    onSuccess: () => {
      // Invalidate the module's query cache to refetch
      queryClient.invalidateQueries({ queryKey: [schema.module] });
    },
  });
}
