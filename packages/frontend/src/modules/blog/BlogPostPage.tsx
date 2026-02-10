import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowLeft, Clock, Calendar, FileText } from 'lucide-react';
import { cn, Badge } from '@erp/ui';
import { getBlogPostBySlug, getBlogPosts } from '@erp/demo-data';
import type { BlogPost } from '@erp/shared';
import { useTheme } from '../../app/ThemeProvider';

const categoryBadgeVariant: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  Manufacturing: 'primary',
  Technology: 'info',
  Operations: 'success',
  Finance: 'warning',
  ERP: 'primary',
  'Supply Chain': 'danger',
};

const categoryGradients: Record<string, string> = {
  Manufacturing: 'from-blue-600 to-blue-800',
  Technology: 'from-violet-600 to-violet-800',
  Operations: 'from-emerald-600 to-emerald-800',
  Finance: 'from-amber-600 to-amber-800',
  ERP: 'from-sky-600 to-sky-800',
  'Supply Chain': 'from-rose-600 to-rose-800',
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const post = useMemo(() => (slug ? getBlogPostBySlug(slug) : null), [slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const allPosts = getBlogPosts();
    return allPosts
      .filter(
        (p) =>
          p.status === 'published' &&
          p.id !== post.id &&
          p.category === post.category
      )
      .slice(0, 3);
  }, [post]);

  const formattedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const gradient = post ? (categoryGradients[post.category] || 'from-gray-600 to-gray-800') : 'from-gray-600 to-gray-800';
  const badgeVariant = post ? (categoryBadgeVariant[post.category] || 'default') : 'default';

  if (!post) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-text-primary">Post not found</h1>
        <p className="mt-2 text-text-secondary">
          The blog post you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Nav bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface-0/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              M
            </div>
            <span className="text-lg font-bold text-text-primary">ManufactureERP</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden md:inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-0 px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded-md"
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="block w-full text-left px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-surface-1 rounded-md"
            >
              Blog
            </Link>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 mt-2"
            >
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* Hero / Featured image area */}
      <section
        className={cn(
          'relative bg-gradient-to-br py-16 md:py-24',
          gradient
        )}
      >
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </button>

          <Badge className="bg-white/20 text-white border-0 mb-4">
            {post.category}
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-white">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{post.wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main content */}
            <article className="lg:col-span-2">
              <div
                className={cn(
                  'prose prose-lg max-w-none',
                  'prose-headings:text-text-primary prose-headings:font-semibold',
                  'prose-p:text-text-secondary prose-p:leading-relaxed',
                  'prose-strong:text-text-primary prose-strong:font-semibold',
                  'prose-ul:text-text-secondary prose-ol:text-text-secondary',
                  'prose-li:text-text-secondary',
                  'prose-a:text-blue-600 dark:prose-a:text-blue-400',
                  'dark:prose-invert'
                )}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog CTA */}
              <div className="mt-10">
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </button>
              </div>
            </article>

            {/* Sidebar: Related Posts */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Related Posts
                </h2>
                {relatedPosts.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No related posts found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <RelatedPostCard
                        key={related.id}
                        post={related}
                        onClick={() => navigate(`/blog/${related.slug}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-1 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} ManufactureERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function RelatedPostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const gradient = categoryGradients[post.category] || 'from-gray-600 to-gray-800';
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <button
      onClick={onClick}
      className="w-full text-left group rounded-lg border border-border bg-surface-1 overflow-hidden hover:shadow-md hover:shadow-black/5 transition-all duration-200"
    >
      <div className={cn('h-24 w-full bg-gradient-to-br', gradient)} />
      <div className="p-3">
        <h4 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h4>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          <span>{formattedDate}</span>
          <span aria-hidden="true">&#183;</span>
          <span>{post.readTimeMinutes} min read</span>
        </div>
      </div>
    </button>
  );
}
