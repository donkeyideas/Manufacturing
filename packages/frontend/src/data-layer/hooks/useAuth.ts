import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAppMode } from '../providers/AppModeProvider';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

interface LoginInput { email: string; password: string }
interface RegisterInput { email: string; password: string; firstName: string; lastName: string; companyName: string }

export function useAuth() {
  const { isDemo } = useAppMode();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (isDemo) {
        return {
          id: 'demo-user',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'admin',
          tenantId: 'demo-tenant',
        } satisfies User;
      }
      const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
      return data.data.user;
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post('/auth/login', input);
      return data.data.user as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post('/auth/register', input);
      return data.data as { user: User; tenant: { id: string; name: string; slug: string } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
