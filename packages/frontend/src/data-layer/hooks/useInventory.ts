import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getInventoryOverview,
  getItems,
  getWarehouses,
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
