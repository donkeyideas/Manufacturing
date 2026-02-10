import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { cn, Badge } from '@erp/ui';
import { getBlogPosts, getBlogCategories } from '@erp/demo-data';
import { useTheme } from '../../app/ThemeProvider';
import { BlogCard } from './components/BlogCard';

const FILTER_CATEGORIES = ['All', 'Manufacturing', 'Technology', 'Operations', 'Finance', 'ERP'];

export default function BlogListPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const posts = useMemo(() => getBlogPosts(), []);
  const categories = useMemo(() => getBlogCategories(), []);

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts]
  );

  const filteredPosts = useMemo(
    () =>
      selectedCategory === 'All'
        ? publishedPosts
        : publishedPosts.filter((p) => p.category === selectedCategory),
    [publishedPosts, selectedCategory]
  );

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

      {/* Hero section */}
      <section className="bg-gradient-to-b from-surface-1 to-surface-0 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Insights, guides, and best practices for modern manufacturing operations,
            ERP implementation, and operational excellence.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="border-b border-border bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
            {FILTER_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">
                No posts found in this category.
              </p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all posts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                />
              ))}
            </div>
          )}
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
