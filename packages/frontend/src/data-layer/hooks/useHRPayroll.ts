import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import {
  getHROverview,
  getEmployees,
  getPayrollPeriods,
  getPayrollRuns,
  getLeaveRequests,
  getTimeEntries,
} from '@erp/demo-data';

export function useHROverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'overview'],
    queryFn: async () => {
      if (isDemo) return getHROverview();
      const { data } = await apiClient.get('/hr/overview');
      return data.data;
    },
  });
}

export function useEmployees() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async () => {
      if (isDemo) return getEmployees();
      const { data } = await apiClient.get('/hr/employees');
      return data.data;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: { employeeNumber: string; firstName: string; lastName: string; hireDate: string; [key: string]: unknown }) => {
      const { data } = await apiClient.post('/hr/employees', employee);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data } = await apiClient.put(`/hr/employees/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/hr/employees/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}

export function useImportEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data } = await apiClient.post('/hr/employees/import', { rows });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}

export function usePayrollPeriods() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'payroll-periods'],
    queryFn: async () => {
      if (isDemo) return getPayrollPeriods();
      const { data } = await apiClient.get('/hr/payroll-periods');
      return data.data;
    },
  });
}

export function usePayrollRuns() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'payroll-runs'],
    queryFn: async () => {
      if (isDemo) return getPayrollRuns();
      const { data } = await apiClient.get('/hr/payroll-runs');
      return data.data;
    },
  });
}

export function useLeaveRequests() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'leave-requests'],
    queryFn: async () => {
      if (isDemo) return getLeaveRequests();
      const { data } = await apiClient.get('/hr/leave-requests');
      return data.data;
    },
  });
}

export function useTimeEntries() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['hr', 'time-entries'],
    queryFn: async () => {
      if (isDemo) return getTimeEntries();
      const { data } = await apiClient.get('/hr/time-entries');
      return data.data;
    },
  });
}
