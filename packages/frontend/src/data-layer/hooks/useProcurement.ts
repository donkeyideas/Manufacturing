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

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { isDemo } = useAppMode();

  return useMutation({
    mutationFn: async (vendor: any) => {
      if (isDemo) {
        // In demo mode, just return the vendor data with generated ID
        return {
          id: `vendor-${Date.now()}`,
          vendorNumber: `V-${String(Date.now()).slice(-4).padStart(4, '0')}`,
          ...vendor,
        };
      }
      const { data } = await apiClient.post('/procurement/vendors', vendor);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { isDemo } = useAppMode();

  return useMutation({
    mutationFn: async (po: any) => {
      if (isDemo) {
        // In demo mode, just return the PO data with generated ID
        return {
          id: `po-${Date.now()}`,
          poNumber: `PO-${String(Date.now()).slice(-4).padStart(4, '0')}`,
          ...po,
        };
      }
      const { data } = await apiClient.post('/procurement/orders', po);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useImportVendors() {
  const queryClient = useQueryClient();
  const { isDemo } = useAppMode();

  return useMutation({
    mutationFn: async (vendors: any[]) => {
      if (isDemo) {
        // In demo mode, just return success
        return { success: vendors.length, errors: [] };
      }
      const { data } = await apiClient.post('/procurement/vendors/import', { vendors });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}

export function useImportPurchaseOrders() {
  const queryClient = useQueryClient();
  const { isDemo } = useAppMode();

  return useMutation({
    mutationFn: async (orders: any[]) => {
      if (isDemo) {
        // In demo mode, just return success
        return { success: orders.length, errors: [] };
      }
      const { data } = await apiClient.post('/procurement/orders/import', { orders });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });
}
