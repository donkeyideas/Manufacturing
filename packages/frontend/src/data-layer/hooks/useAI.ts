import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getAIOverview, getChatHistory, getDocumentQueue, getAIInsightsList } from '@erp/demo-data';

export function useAIOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['ai', 'overview'],
    queryFn: async () => {
      if (isDemo) return getAIOverview();
      const { data } = await apiClient.get('/ai/overview');
      return data.data;
    },
  });
}

export function useChatHistory() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['ai', 'chat-history'],
    queryFn: async () => {
      if (isDemo) return getChatHistory();
      const { data } = await apiClient.get('/ai/chat-history');
      return data.data;
    },
  });
}

export function useDocumentQueue() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['ai', 'document-queue'],
    queryFn: async () => {
      if (isDemo) return getDocumentQueue();
      const { data } = await apiClient.get('/ai/document-queue');
      return data.data;
    },
  });
}

export function useAIInsights() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: async () => {
      if (isDemo) return getAIInsightsList();
      const { data } = await apiClient.get('/ai/insights');
      return data.data;
    },
  });
}
