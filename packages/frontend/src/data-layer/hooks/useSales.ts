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
      return (data.data || []).map((row: any) => ({
        ...row,
        soNumber: row.orderNumber,
        soDate: row.orderDate,
        totalAmount: Number(row.totalAmount ?? 0),
        subtotal: Number(row.subtotal ?? 0),
        taxAmount: Number(row.taxAmount ?? 0),
      }));
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

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: { customerNumber: string; customerName: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/sales/customers', customer);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/sales/customers/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/sales/customers/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/sales/orders/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useImportCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/sales/customers/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useImportSalesOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/sales/orders/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
