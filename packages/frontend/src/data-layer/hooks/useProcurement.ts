import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getProcurementOverview,
  getVendors,
  getPurchaseOrders,
} from '@erp/demo-data';

export function useProcurementOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['procurement', 'overview'],
    queryFn: async () => {
      if (isDemo) return getProcurementOverview();
      const { data } = await apiClient.get('/procurement/overview');
      return data.data;
    },
  });
}

export function useVendors() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['procurement', 'vendors'],
    queryFn: async () => {
      if (isDemo) return getVendors();
      const { data } = await apiClient.get('/procurement/vendors');
      return data.data;
    },
  });
}

export function usePurchaseOrders() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['procurement', 'orders'],
    queryFn: async () => {
      if (isDemo) return getPurchaseOrders();
      const { data } = await apiClient.get('/procurement/orders');
      return data.data;
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (po: { poDate: string; vendorId: string; lines: unknown[] }) => {
      const { data } = await apiClient.post('/procurement/orders', po);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}
