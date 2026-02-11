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

// ═══════════════════════════════════════════════════════════════
//  INBOX (Contact Messages)
// ═══════════════════════════════════════════════════════════════

export interface ContactMessage {
  id: string;
  sender: string;
  email: string;
  company: string | null;
  phone: string | null;
  location: string | null;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  status: 'new' | 'read' | 'replied' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export function useInboxMessages() {
  return useQuery({
    queryKey: ['admin-inbox'],
    queryFn: async () => {
      const res = await adminClient.get('/inbox');
      return res.data.data as ContactMessage[];
    },
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; isRead?: boolean; isStarred?: boolean; status?: string }) => {
      const res = await adminClient.patch(`/inbox/${id}`, data);
      return res.data.data as ContactMessage;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inbox'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await adminClient.patch('/inbox/mark-all-read');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inbox'] }),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.delete(`/inbox/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inbox'] }),
  });
}

// ═══════════════════════════════════════════════════════════════
//  BLOG (Platform Blog Posts)
// ═══════════════════════════════════════════════════════════════

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';
  category: string | null;
  tags: string[];
  featuredImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImageUrl: string | null;
  wordCount: number;
  viewCount: number;
  seoScore: number;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const res = await adminClient.get('/blog');
      return res.data.data as AdminBlogPost[];
    },
  });
}

export function useAdminBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      const res = await adminClient.get(`/blog/${id}`);
      return res.data.data as AdminBlogPost;
    },
    enabled: !!id,
  });
}

export function useAdminBlogCategories() {
  return useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: async () => {
      const res = await adminClient.get('/blog/categories');
      return res.data.data as Array<{ name: string; slug: string }>;
    },
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminBlogPost>) => {
      const res = await adminClient.post('/blog', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<AdminBlogPost>) => {
      const res = await adminClient.put(`/blog/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      qc.invalidateQueries({ queryKey: ['admin-blog-post'] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.delete(`/blog/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });
}

// ═══════════════════════════════════════════════════════════════
//  SYSTEM SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface AdminSetting {
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export interface StorageStats {
  database: string;
  databaseSize: string;
  activeConnections: number;
  poolMax: number;
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminClient.get('/settings');
      return res.data.data as { settings: AdminSetting[]; grouped: Record<string, Record<string, string>> };
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: string; category: string }) => {
      const res = await adminClient.put(`/settings/${key}`, { value, category });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}

export function useBulkUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Array<{ key: string; value: string; category: string }>) => {
      await adminClient.put('/settings', { settings });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}

export function useStorageStats() {
  return useQuery({
    queryKey: ['admin-storage-stats'],
    queryFn: async () => {
      const res = await adminClient.get('/settings/storage');
      return res.data.data as StorageStats;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
//  SEO ANALYTICS
// ═══════════════════════════════════════════════════════════════

export interface SEOAnalytics {
  kpis: {
    organicTraffic: { value: number; change: number };
    organicSignups: { value: number; change: number };
    conversionRate: { value: number; change: number };
    contentROI: { value: number; change: number };
  };
  trafficData: Array<{ month: string; visits: number; signups: number }>;
  landingPages: Array<{ page: string; traffic: number; signups: number; conv: number; bounce: number }>;
  keywords: Array<{ keyword: string; pos: number; volume: number; difficulty: number; traffic: number }>;
  topContent: Array<{ title: string; views: number; timeOnPage: string; leads: number; status: string }>;
  contentStats: { totalArticles: number; avgMonthlyReads: number; leadsFromContent: number };
  aiVisibility: {
    chatgptMentions: { value: number; change: number };
    googleAIOverview: { value: number; change: number };
    perplexityCitations: { value: number; change: number };
    overallScore: { value: number; change: number };
  };
  aiTrendData: Array<{ month: string; chatgpt: number; googleAI: number; perplexity: number; bingCopilot: number }>;
  aiQueries: Array<{ query: string; engine: string; position: number; status: string }>;
  competitors: Array<{ name: string; score: number; color: string }>;
}

export function useSEOAnalytics() {
  return useQuery({
    queryKey: ['admin-seo-analytics'],
    queryFn: async () => {
      const res = await adminClient.get('/settings/seo/overview');
      return res.data.data as SEOAnalytics;
    },
  });
}
