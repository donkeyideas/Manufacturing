import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getEDIOverview,
  getEDITradingPartners,
  getEDITransactions,
  getEDIDocumentMaps,
  getEDISettings,
} from '@erp/demo-data';

// ─── Overview ───

export function useEDIOverview() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'overview'],
    queryFn: async () => {
      if (isDemo) return getEDIOverview();
      const { data } = await apiClient.get('/edi/overview');
      return data.data;
    },
  });
}

// ─── Trading Partners ───

export function useEDITradingPartners() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'partners'],
    queryFn: async () => {
      if (isDemo) return getEDITradingPartners();
      const { data } = await apiClient.get('/edi/partners');
      return data.data;
    },
  });
}

export function useCreateEDIPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partner: Record<string, unknown>) => {
      const { data } = await apiClient.post('/edi/partners', partner);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useUpdateEDIPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const { data } = await apiClient.put(`/edi/partners/${id}`, body);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useDeleteEDIPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/edi/partners/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useTestEDIConnection() {
  return useMutation({
    mutationFn: async (partnerId: string) => {
      const { data } = await apiClient.post(`/edi/partners/${partnerId}/test-connection`);
      return data.data;
    },
  });
}

// ─── Transactions ───

export function useEDITransactions(filters?: Record<string, string>) {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'transactions', filters],
    queryFn: async () => {
      if (isDemo) return getEDITransactions();
      const params = new URLSearchParams(filters || {}).toString();
      const { data } = await apiClient.get(`/edi/transactions${params ? `?${params}` : ''}`);
      return data.data;
    },
  });
}

export function useEDITransaction(id: string) {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'transactions', id],
    enabled: !!id,
    queryFn: async () => {
      if (isDemo) {
        const all = getEDITransactions();
        return all.find((t) => t.id === id) || null;
      }
      const { data } = await apiClient.get(`/edi/transactions/${id}`);
      return data.data;
    },
  });
}

export function useProcessInboundEDI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { partnerId: string; documentType: string; format?: string; rawContent: string }) => {
      const { data } = await apiClient.post('/edi/transactions/inbound', body);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useGenerateOutboundEDI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { partnerId: string; documentType: string; format?: string; sourceRecordId: string; sendVia?: string }) => {
      const { data } = await apiClient.post('/edi/transactions/outbound', body);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useAcknowledgeEDI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await apiClient.post(`/edi/transactions/${transactionId}/acknowledge`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

export function useReprocessEDI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await apiClient.post(`/edi/transactions/${transactionId}/reprocess`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi'] }),
  });
}

// ─── Document Maps ───

export function useEDIDocumentMaps() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'maps'],
    queryFn: async () => {
      if (isDemo) return getEDIDocumentMaps();
      const { data } = await apiClient.get('/edi/maps');
      return data.data;
    },
  });
}

export function useCreateEDIDocumentMap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (map: Record<string, unknown>) => {
      const { data } = await apiClient.post('/edi/maps', map);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi', 'maps'] }),
  });
}

export function useUpdateEDIDocumentMap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const { data } = await apiClient.put(`/edi/maps/${id}`, body);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi', 'maps'] }),
  });
}

export function useDeleteEDIDocumentMap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/edi/maps/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi', 'maps'] }),
  });
}

// ─── Settings ───

export function useEDISettings() {
  const { isDemo } = useAppMode();
  return useQuery({
    queryKey: ['edi', 'settings'],
    queryFn: async () => {
      if (isDemo) return getEDISettings();
      const { data } = await apiClient.get('/edi/settings');
      return data.data;
    },
  });
}

export function useUpdateEDISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const { data } = await apiClient.put('/edi/settings', settings);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edi', 'settings'] }),
  });
}
