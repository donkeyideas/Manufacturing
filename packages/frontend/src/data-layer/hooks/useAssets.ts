import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getAssetsOverview, getFixedAssets, getDepreciationSchedule, getMaintenanceRecords } from '@erp/demo-data';

export function useAssetsOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['assets', 'overview'],
    queryFn: async () => {
      if (isDemo) return getAssetsOverview();
      const { data } = await apiClient.get('/assets/overview');
      return data.data;
    },
  });
}

export function useFixedAssets() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['assets', 'fixed-assets'],
    queryFn: async () => {
      if (isDemo) return getFixedAssets();
      const { data } = await apiClient.get('/assets/fixed-assets');
      return data.data;
    },
  });
}

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: { assetNumber: string; assetName: string; acquisitionDate: string; originalCost: number; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/assets/fixed-assets', asset);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/assets/fixed-assets/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/assets/fixed-assets/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useImportFixedAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/assets/fixed-assets/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDepreciationSchedule() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['assets', 'depreciation-schedule'],
    queryFn: async () => {
      if (isDemo) return getDepreciationSchedule();
      const { data } = await apiClient.get('/assets/depreciation-schedule');
      return data.data;
    },
  });
}

export function useMaintenanceRecords() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['assets', 'maintenance-records'],
    queryFn: async () => {
      if (isDemo) return getMaintenanceRecords();
      const { data } = await apiClient.get('/assets/maintenance-records');
      return data.data;
    },
  });
}
