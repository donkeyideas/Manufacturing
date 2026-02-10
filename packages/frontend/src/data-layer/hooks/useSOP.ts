import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getSOPOverview,
  getSOPs,
  getSOPById,
  getSOPAcknowledgments,
} from '@erp/demo-data';

export function useSOPOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sop', 'overview'],
    queryFn: async () => {
      if (isDemo) return getSOPOverview();
      const { data } = await apiClient.get('/sop/overview');
      return data.data;
    },
  });
}

export function useSOPs() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sop', 'list'],
    queryFn: async () => {
      if (isDemo) return getSOPs();
      const { data } = await apiClient.get('/sop');
      return data.data;
    },
  });
}

export function useSOP(id: string) {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sop', 'detail', id],
    queryFn: async () => {
      if (isDemo) return getSOPById(id);
      const { data } = await apiClient.get(`/sop/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useSOPAcknowledgments() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sop', 'acknowledgments'],
    queryFn: async () => {
      if (isDemo) return getSOPAcknowledgments();
      const { data } = await apiClient.get('/sop/acknowledgments');
      return data.data;
    },
  });
}
