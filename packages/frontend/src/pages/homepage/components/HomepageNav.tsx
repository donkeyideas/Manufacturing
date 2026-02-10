import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@erp/ui';
import { useTheme } from '../../../app/ThemeProvider';

export function HomepageNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const links = [
    { label: 'Features', action: () => scrollTo('features') },
    { label: 'Pricing', action: () => scrollTo('pricing') },
    { label: 'Testimonials', action: () => scrollTo('testimonials') },
    { label: 'FAQ', action: () => scrollTo('faq') },
    { label: 'Blog', action: () => navigate('/blog') },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-surface-0/95 backdrop-blur-sm border-b border-border shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
            M
          </div>
          <span className="text-lg font-bold text-text-primary">ManufactureERP</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
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
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface-0 px-4 py-4 space-y-2">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded-md"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 mt-2"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}
