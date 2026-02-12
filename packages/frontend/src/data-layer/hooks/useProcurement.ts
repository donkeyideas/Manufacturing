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
      return (data.data || []).map((row: any) => ({
        ...row,
        name: row.vendorName,
        creditLimit: Number(row.creditLimit ?? 0),
      }));
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
      return (data.data || []).map((row: any) => ({
        ...row,
        orderDate: row.poDate,
        vendorName: row.vendorName,
        totalAmount: Number(row.totalAmount ?? 0),
        subtotal: Number(row.subtotal ?? 0),
        taxAmount: Number(row.taxAmount ?? 0),
      }));
    },
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: { vendorNumber: string; vendorName: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/procurement/vendors', vendor);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/procurement/vendors/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/procurement/vendors/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (po: any) => {
      const { data } = await apiClient.post('/procurement/orders', po);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/procurement/orders/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useImportVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/procurement/vendors/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useImportPurchaseOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/procurement/orders/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useRequisitions() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['procurement', 'requisitions'],
    queryFn: async () => {
      if (isDemo) {
        const { getRequisitions } = await import('@erp/demo-data');
        return getRequisitions();
      }
      const { data } = await apiClient.get('/procurement/requisitions');
      return data.data ?? [];
    },
  });
}

export function useVendorInvoices() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['procurement', 'vendor-invoices'],
    queryFn: async () => {
      if (isDemo) {
        const { getVendorInvoices } = await import('@erp/demo-data');
        return getVendorInvoices();
      }
      const { data } = await apiClient.get('/procurement/vendor-invoices');
      return data.data ?? [];
    },
  });
}

export function useGoodsReceipts() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['procurement', 'goods-receipts'],
    queryFn: async () => {
      if (isDemo) {
        const { getGoodsReceipts } = await import('@erp/demo-data');
        return getGoodsReceipts();
      }
      const { data } = await apiClient.get('/procurement/goods-receipts');
      return data.data ?? [];
    },
  });
}
