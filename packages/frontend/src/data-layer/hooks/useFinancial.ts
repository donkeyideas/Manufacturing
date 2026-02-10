import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getFinancialOverview,
  getChartOfAccounts,
  getJournalEntries,
} from '@erp/demo-data';

export function useFinancialOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['financial', 'overview'],
    queryFn: async () => {
      if (isDemo) return getFinancialOverview();
      const { data } = await apiClient.get('/financial/overview');
      return data.data;
    },
  });
}

export function useChartOfAccounts() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['financial', 'accounts'],
    queryFn: async () => {
      if (isDemo) return getChartOfAccounts();
      const { data } = await apiClient.get('/financial/accounts');
      return data.data;
    },
  });
}

export function useJournalEntries() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['financial', 'journal-entries'],
    queryFn: async () => {
      if (isDemo) return getJournalEntries();
      const { data } = await apiClient.get('/financial/journal-entries');
      return data.data;
    },
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: { entryDate: string; description?: string; lines: unknown[] }) => {
      const { data } = await apiClient.post('/financial/journal-entries', entry);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/financial/journal-entries/${id}/post`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}
