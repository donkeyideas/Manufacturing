import { useNavigate } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '/dashboard' },
    { label: 'Blog', href: '/blog' },
  ],
  Modules: [
    { label: 'Manufacturing', href: '/manufacturing' },
    { label: 'Financial', href: '/financial' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'HR & Payroll', href: '/hr' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
};

export function HomepageFooter() {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="border-t border-border bg-surface-0 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
                M
              </div>
              <span className="text-lg font-bold text-text-primary">ManufactureERP</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              The complete manufacturing ERP platform built for modern manufacturers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-text-primary mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleClick(link.href)}
                      className="text-xs text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <p className="text-2xs text-text-muted">
            &copy; {new Date().getFullYear()} ManufactureERP. All rights reserved.
          </p>
          <p className="text-2xs text-text-muted mt-2 md:mt-0">
            v3.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}
