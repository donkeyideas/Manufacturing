import { useQuery } from '@tanstack/react-query';
import { useAppMode, useIndustry } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getIndustryDashboardSummary } from '@erp/demo-data';

export function useDashboardSummary() {
  const { isDemo } = useAppMode();
  const { industryType } = useIndustry();

  return useQuery({
    queryKey: ['dashboard', 'overview', industryType],
    queryFn: async () => {
      if (isDemo) return getIndustryDashboardSummary(industryType);
      const { data } = await apiClient.get('/dashboard/overview');
      return data.data;
    },
  });
}
