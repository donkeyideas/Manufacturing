import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from './client';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAdminAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await adminClient.get('/auth/me');
      return res.data.data.admin as AdminUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const res = await adminClient.post('/auth/login', creds);
      return res.data.data.admin as AdminUser;
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(['admin-me'], admin);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await adminClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['admin-me'], null);
      queryClient.clear();
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      const res = await adminClient.post('/auth/setup', data);
      return res.data.data.admin as AdminUser;
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(['admin-me'], admin);
    },
  });

  return {
    admin: data ?? null,
    isLoading,
    isAuthenticated: !!data && !isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    setup: setupMutation.mutateAsync,
    isSettingUp: setupMutation.isPending,
  };
}
