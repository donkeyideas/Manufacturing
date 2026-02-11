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
      return (data.data || []).map((row: any) => ({
        ...row,
        name: row.accountName,
        type: row.accountType,
        balance: Number(row.balance ?? 0),
      }));
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
      return (data.data || []).map((row: any) => ({
        ...row,
        date: row.entryDate,
        type: row.entryType || 'standard',
        totalDebit: Number(row.totalDebit ?? 0),
        totalCredit: Number(row.totalCredit ?? 0),
      }));
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

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: {
      accountNumber: string;
      name: string;
      type: string;
      description?: string;
      parentAccountId?: string;
      normalBalance?: string;
      isActive?: boolean;
    }) => {
      const { data } = await apiClient.post('/financial/accounts', {
        accountNumber: account.accountNumber,
        accountName: account.name,
        accountType: account.type,
        description: account.description,
        parentAccountId: account.parentAccountId,
        isActive: account.isActive,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}

export function useImportAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: any[]) => {
      const { data } = await apiClient.post('/financial/accounts/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const payload: Record<string, unknown> = { ...updates };
      if ('name' in payload) { payload.accountName = payload.name; delete payload.name; }
      if ('type' in payload) { payload.accountType = payload.type; delete payload.type; }
      const { data } = await apiClient.put(`/financial/accounts/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/financial/accounts/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/financial/journal-entries/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
  });
}

export function useImportJournalEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: any[]) => {
      const { data } = await apiClient.post('/financial/journal-entries/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'journal-entries'] });
    },
  });
}
