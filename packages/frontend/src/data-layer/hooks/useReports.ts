import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getReportsOverview,
  getReportDefinitions,
  getScheduledReports,
  getReportHistory,
  getAnalyticsDashboard,
} from '@erp/demo-data';

export function useReportsOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: async () => {
      if (isDemo) return getReportsOverview();
      const { data } = await apiClient.get('/reports/overview');
      return data.data;
    },
  });
}

export function useReportDefinitions() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['reports', 'definitions'],
    queryFn: async () => {
      if (isDemo) return getReportDefinitions();
      const { data } = await apiClient.get('/reports/definitions');
      return data.data;
    },
  });
}

export function useScheduledReports() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: async () => {
      if (isDemo) return getScheduledReports();
      const { data } = await apiClient.get('/reports/scheduled');
      return data.data;
    },
  });
}

export function useReportHistory() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['reports', 'history'],
    queryFn: async () => {
      if (isDemo) return getReportHistory();
      const { data } = await apiClient.get('/reports/history');
      return data.data;
    },
  });
}

export function useAnalyticsDashboard() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['reports', 'analytics'],
    queryFn: async () => {
      if (isDemo) return getAnalyticsDashboard();
      const { data } = await apiClient.get('/reports/analytics');
      return data.data;
    },
  });
}
