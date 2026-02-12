import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getManufacturingOverview,
  getWorkOrders,
  getBillsOfMaterials,
} from '@erp/demo-data';

export function useManufacturingOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['manufacturing', 'overview'],
    queryFn: async () => {
      if (isDemo) return getManufacturingOverview();
      const { data } = await apiClient.get('/manufacturing/overview');
      return data.data;
    },
  });
}

export function useWorkOrders() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['manufacturing', 'work-orders'],
    queryFn: async () => {
      if (isDemo) return getWorkOrders();
      const { data } = await apiClient.get('/manufacturing/work-orders');
      return (data.data || []).map((row: any) => ({
        ...row,
        workOrderNumber: row.woNumber,
        finishedItemNumber: row.itemNumber,
        finishedItemName: row.itemName,
        startDate: row.plannedStartDate,
        dueDate: row.plannedEndDate,
        actualCompletionDate: row.actualEndDate,
      }));
    },
  });
}

export function useBOMs() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['manufacturing', 'boms'],
    queryFn: async () => {
      if (isDemo) return getBillsOfMaterials();
      const { data } = await apiClient.get('/manufacturing/boms');
      return data.data;
    },
  });
}

export function useWorkCenters() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['manufacturing', 'work-centers'],
    queryFn: async () => {
      if (isDemo) {
        // Demo data fallback
        return [];
      }
      const { data } = await apiClient.get('/manufacturing/work-centers');
      return data.data;
    },
  });
}

export function useRoutings() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['manufacturing', 'routings'],
    queryFn: async () => {
      if (isDemo) {
        return [];
      }
      const { data } = await apiClient.get('/manufacturing/routings');
      return data.data;
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wo: { itemId: string; quantityOrdered: number; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/work-orders', wo);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/manufacturing/work-orders/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/manufacturing/work-orders/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useCreateBOM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bom: { bomName: string; finishedItemId: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/boms', bom);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useCreateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wc: { workCenterCode: string; workCenterName: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/work-centers', wc);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useUpdateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/manufacturing/work-centers/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useDeleteWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/manufacturing/work-centers/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useCreateRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routing: { routingName: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/routings', routing);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useDeleteRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/manufacturing/routings/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.put(`/manufacturing/work-orders/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useImportBOMs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/manufacturing/boms/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useImportWorkOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/manufacturing/work-orders/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useImportWorkCenters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/manufacturing/work-centers/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
    },
  });
}

export function useProductionTracking() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['manufacturing', 'production-tracking'],
    queryFn: async () => {
      if (isDemo) {
        const { getProductionTracking } = await import('@erp/demo-data');
        return getProductionTracking();
      }
      const { data } = await apiClient.get('/manufacturing/production-tracking');
      return data.data ?? [];
    },
  });
}

export function useQualityRecords() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['manufacturing', 'quality-records'],
    queryFn: async () => {
      if (isDemo) {
        const { getQualityRecords } = await import('@erp/demo-data');
        return getQualityRecords();
      }
      const { data } = await apiClient.get('/manufacturing/quality-records');
      return data.data ?? [];
    },
  });
}
