import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getEmployeeProfile,
  getClockEntries,
  getPayStubs,
  getLeaveBalances,
  getPortalLeaveRequests,
  getEmployeeReviews,
  getShiftSchedule,
  getTrainingCertifications,
  getCompanyAnnouncements,
  getPortalOverview,
} from '@erp/demo-data';

export function usePortalOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'overview'],
    queryFn: async () => {
      if (isDemo) return getPortalOverview();
      const { data } = await apiClient.get('/portal/overview');
      return data.data;
    },
  });
}

export function useEmployeeProfile() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: async () => {
      if (isDemo) return getEmployeeProfile();
      const { data } = await apiClient.get('/portal/profile');
      return data.data;
    },
  });
}

export function useClockEntries() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'clock-entries'],
    queryFn: async () => {
      if (isDemo) return getClockEntries();
      const { data } = await apiClient.get('/portal/clock-entries');
      return data.data;
    },
  });
}

export function usePayStubs() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'pay-stubs'],
    queryFn: async () => {
      if (isDemo) return getPayStubs();
      const { data } = await apiClient.get('/portal/pay-stubs');
      return data.data;
    },
  });
}

export function useLeaveBalances() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'leave-balances'],
    queryFn: async () => {
      if (isDemo) return getLeaveBalances();
      const { data } = await apiClient.get('/portal/leave-balances');
      return data.data;
    },
  });
}

export function usePortalLeaveRequests() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'leave-requests'],
    queryFn: async () => {
      if (isDemo) return getPortalLeaveRequests();
      const { data } = await apiClient.get('/portal/leave-requests');
      return data.data;
    },
  });
}

export function useEmployeeReviews() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'reviews'],
    queryFn: async () => {
      if (isDemo) return getEmployeeReviews();
      const { data } = await apiClient.get('/portal/reviews');
      return data.data;
    },
  });
}

export function useShiftSchedule() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'shift-schedule'],
    queryFn: async () => {
      if (isDemo) return getShiftSchedule();
      const { data } = await apiClient.get('/portal/shift-schedule');
      return data.data;
    },
  });
}

export function useTrainingCertifications() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'training'],
    queryFn: async () => {
      if (isDemo) return getTrainingCertifications();
      const { data } = await apiClient.get('/portal/training');
      return data.data;
    },
  });
}

export function useCompanyAnnouncements() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['portal', 'announcements'],
    queryFn: async () => {
      if (isDemo) return getCompanyAnnouncements();
      const { data } = await apiClient.get('/portal/announcements');
      return data.data;
    },
  });
}
