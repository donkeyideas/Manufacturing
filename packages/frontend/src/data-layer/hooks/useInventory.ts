import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getInventoryOverview,
  getItems,
  getWarehouses,
  getInventoryOnHand,
} from '@erp/demo-data';

export function useInventoryOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['inventory', 'overview'],
    queryFn: async () => {
      if (isDemo) return getInventoryOverview();
      const { data } = await apiClient.get('/inventory/overview');
      return data.data;
    },
  });
}

export function useItems() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['inventory', 'items'],
    queryFn: async () => {
      if (isDemo) return getItems();
      const { data } = await apiClient.get('/inventory/items');
      return data.data;
    },
  });
}

export function useWarehouses() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['inventory', 'warehouses'],
    queryFn: async () => {
      if (isDemo) return getWarehouses();
      const { data } = await apiClient.get('/inventory/warehouses');
      return data.data;
    },
  });
}

export function useInventoryOnHand() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['inventory', 'on-hand'],
    queryFn: async () => {
      if (isDemo) return getInventoryOnHand();
      const { data } = await apiClient.get('/inventory/on-hand');
      return data.data;
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { itemNumber: string; itemName: string; itemType: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/inventory/items', item);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/inventory/items/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/inventory/items/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouse: { warehouseCode: string; warehouseName: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/inventory/warehouses', warehouse);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useImportItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/inventory/items/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/inventory/warehouses/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/inventory/warehouses/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useImportWarehouses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/inventory/warehouses/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
