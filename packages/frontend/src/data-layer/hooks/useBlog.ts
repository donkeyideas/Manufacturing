import { useQuery } from '@tanstack/react-query';
import { useAppMode } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getBlogPosts, getBlogCategories, getBlogPostBySlug } from '@erp/demo-data';

export function useBlogPosts() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['blog', 'posts'],
    queryFn: async () => {
      if (isDemo) return getBlogPosts();
      const { data } = await apiClient.get('/blog/posts');
      return data.data;
    },
  });
}

export function useBlogPost(slug: string) {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: async () => {
      if (isDemo) return getBlogPostBySlug(slug);
      const { data } = await apiClient.get(`/blog/posts/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  const { isDemo } = useAppMode();

  return useQuery({
    queryKey: ['blog', 'categories'],
    queryFn: async () => {
      if (isDemo) return getBlogCategories();
      const { data } = await apiClient.get('/blog/categories');
      return data.data;
    },
  });
}
