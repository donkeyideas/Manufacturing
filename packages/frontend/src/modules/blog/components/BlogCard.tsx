import type { BlogPost } from '@erp/shared';
import { cn, Badge } from '@erp/ui';

const categoryGradients: Record<string, string> = {
  Manufacturing: 'from-blue-500 to-blue-700',
  Technology: 'from-violet-500 to-violet-700',
  Operations: 'from-emerald-500 to-emerald-700',
  Finance: 'from-amber-500 to-amber-700',
  ERP: 'from-sky-500 to-sky-700',
  'Supply Chain': 'from-rose-500 to-rose-700',
};

const categoryBadgeVariant: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  Manufacturing: 'primary',
  Technology: 'info',
  Operations: 'success',
  Finance: 'warning',
  ERP: 'primary',
  'Supply Chain': 'danger',
};

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

export function BlogCard({ post, onClick }: BlogCardProps) {
  const gradient = categoryGradients[post.category] || 'from-gray-500 to-gray-700';
  const badgeVariant = categoryBadgeVariant[post.category] || 'default';

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const authorInitial = post.author.charAt(0).toUpperCase();

  return (
    <article
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-border bg-surface-1 overflow-hidden',
        'transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
        'dark:hover:shadow-black/20'
      )}
    >
      {/* Featured image placeholder */}
      <div
        className={cn(
          'h-48 w-full bg-gradient-to-br',
          gradient,
          'flex items-center justify-center'
        )}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z"
            />
          </svg>
          <span className="text-xs font-medium">{post.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <Badge variant={badgeVariant}>{post.category}</Badge>
        </div>

        <h3 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>

        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author and meta */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">
            {authorInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {post.author}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{formattedDate}</span>
              <span aria-hidden="true">&#183;</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
