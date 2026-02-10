import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '@erp/ui';
import { getBlogPosts } from '@erp/demo-data';
import { Plus, Edit, Trash2 } from 'lucide-react';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'info'> = {
  published: 'success',
  draft: 'default',
  archived: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

function getSEOColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function BlogManagement() {
  const navigate = useNavigate();
  const posts = useMemo(() => getBlogPosts(), []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Blog Management</h1>
          <p className="text-xs text-text-muted">Create and manage blog posts for the company website</p>
        </div>
        <Button onClick={() => navigate('/blog/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Title</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-24">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-28">Category</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-20">SEO</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-20">Views</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-28">Published</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-border last:border-0 hover:bg-surface-1 transition-colors"
              >
                <td className="px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-text-primary truncate max-w-xs">
                      {post.title}
                    </p>
                    <p className="text-2xs text-text-muted truncate max-w-xs mt-0.5">
                      /{post.slug}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={STATUS_VARIANT[post.status] || 'default'}>
                    {STATUS_LABEL[post.status] || post.status}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-sm text-text-secondary">{post.category}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-sm font-medium ${getSEOColor(post.seoScore)}`}>
                    {post.seoScore}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm text-text-secondary">
                  {post.viewCount.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-sm text-text-secondary">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/blog/${post.id}/edit`)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BlogManagement;
