import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from './client';

// ─── Demo Codes ───

export interface DemoCode {
  id: string;
  code: string;
  label: string | null;
  template: string;
  isActive: boolean | null;
  usageCount: number | null;
  maxUsages: number | null;
  expiresAt: string;
  modulesEnabled: string | null;
  createdBy: string | null;
  createdAt: string;
}

export function useDemoCodes() {
  return useQuery({
    queryKey: ['admin-demo-codes'],
    queryFn: async () => {
      const res = await adminClient.get('/demo-codes');
      return res.data.data as DemoCode[];
    },
  });
}

export function useDemoCodeStats() {
  return useQuery({
    queryKey: ['admin-demo-code-stats'],
    queryFn: async () => {
      const res = await adminClient.get('/demo-codes/stats');
      return res.data.data as { totalCodes: number; activeCodes: number; totalUses: number; expiredCodes: number };
    },
  });
}

export function useCreateDemoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { label: string; template?: string; maxUsages?: number; expiryDays?: number }) => {
      const res = await adminClient.post('/demo-codes', data);
      return res.data.data as DemoCode;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-demo-codes'] });
      qc.invalidateQueries({ queryKey: ['admin-demo-code-stats'] });
    },
  });
}

export function useRevokeDemoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminClient.patch(`/demo-codes/${id}/revoke`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-demo-codes'] });
      qc.invalidateQueries({ queryKey: ['admin-demo-code-stats'] });
    },
  });
}

// ─── Platform Stats ───

export interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  activeUsers: number;
  activeDemoCodes: number;
  loginsLast24h: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminClient.get('/stats');
      return res.data.data as PlatformStats;
    },
  });
}

// ─── Audit Logs ───

export interface AuditLog {
  id: string;
  email: string;
  userType: string;
  userId: string | null;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: string;
}

export function useAuditLogs(options?: { userType?: string; limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (options?.userType) params.set('userType', options.userType);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  return useQuery({
    queryKey: ['admin-audit-logs', options],
    queryFn: async () => {
      const res = await adminClient.get(`/audit-logs?${params.toString()}`);
      return res.data.data as { logs: AuditLog[]; total: number };
    },
  });
}

// ─── Users ───

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean | null;
  lastLoginAt: string | null;
  tenantId: string;
  createdAt: string;
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await adminClient.get('/users');
      return res.data.data as PlatformUser[];
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.patch(`/users/${id}/deactivate`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.patch(`/users/${id}/activate`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// ─── Tenants ───

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  industryType: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const res = await adminClient.get('/tenants');
      return res.data.data as Tenant[];
    },
  });
}
