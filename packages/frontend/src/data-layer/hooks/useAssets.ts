import { useQuery } from '@tanstack/react-query';
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
