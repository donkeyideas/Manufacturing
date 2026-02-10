import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getSalesOverview,
  getCustomers,
  getSalesOrders,
} from '@erp/demo-data';

export function useSalesOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sales', 'overview'],
    queryFn: async () => {
      if (isDemo) return getSalesOverview();
      const { data } = await apiClient.get('/sales/overview');
      return data.data;
    },
  });
}

export function useCustomers() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sales', 'customers'],
    queryFn: async () => {
      if (isDemo) return getCustomers();
      const { data } = await apiClient.get('/sales/customers');
      return data.data;
    },
  });
}

export function useSalesOrders() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['sales', 'orders'],
    queryFn: async () => {
      if (isDemo) return getSalesOrders();
      const { data } = await apiClient.get('/sales/orders');
      return data.data;
    },
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: { orderDate: string; customerId: string; lines: unknown[] }) => {
      const { data } = await apiClient.post('/sales/orders', order);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
