import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getProjectsOverview, getProjects, getTasks, getSprints } from '@erp/demo-data';

export function useProjectsOverview() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['projects', 'overview'],
    queryFn: async () => {
      if (isDemo) return getProjectsOverview();
      const { data } = await apiClient.get('/projects/overview');
      return data.data;
    },
  });
}

export function useProjects() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['projects', 'list'],
    queryFn: async () => {
      if (isDemo) return getProjects();
      const { data } = await apiClient.get('/projects');
      return data.data;
    },
  });
}

export function useTasks() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['projects', 'tasks'],
    queryFn: async () => {
      if (isDemo) return getTasks();
      const { data } = await apiClient.get('/projects/tasks');
      return data.data;
    },
  });
}

export function useSprints() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['projects', 'sprints'],
    queryFn: async () => {
      if (isDemo) return getSprints();
      const { data } = await apiClient.get('/projects/sprints');
      return data.data;
    },
  });
}
