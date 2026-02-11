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
      return data.data;
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

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wo: { workOrderNumber?: string; finishedItemName: string; quantityOrdered: number; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/work-orders', wo);
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
    mutationFn: async (bom: { finishedItemName: string; bomType: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/manufacturing/boms', bom);
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
