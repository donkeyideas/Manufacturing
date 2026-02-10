import {
  Factory, DollarSign, Package, ShoppingCart, Users, Bot,
  BarChart3, Shield,
} from 'lucide-react';

const features = [
  {
    icon: Factory,
    title: 'Manufacturing',
    description: 'Work orders, BOMs, routings, production tracking, and quality control — all in real-time.',
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    icon: DollarSign,
    title: 'Financial',
    description: 'Chart of accounts, journal entries, general ledger, and financial statements with automated GL posting.',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Multi-warehouse tracking, cycle counts, demand planning, and automated reorder points.',
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & Procurement',
    description: 'End-to-end order management from quotes to invoices, with vendor management and PO automation.',
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'HR & Payroll',
    description: 'Employee portal, time clock, automated payroll, leave management, and performance reviews.',
    color: 'text-rose-500 bg-rose-500/10',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Generate SOPs, blog content, and reports with AI. Get insights and anomaly detection automatically.',
    color: 'text-sky-500 bg-sky-500/10',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Custom report builder, scheduled reports, and real-time analytics dashboards.',
    color: 'text-indigo-500 bg-indigo-500/10',
  },
  {
    icon: Shield,
    title: 'Enterprise-Ready',
    description: 'Multi-tenant, role-based access, audit trails, and SOC 2 compliant security.',
    color: 'text-teal-500 bg-teal-500/10',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything You Need to Run Manufacturing
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A complete ERP platform purpose-built for manufacturers, with modules that work
            seamlessly together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-surface-0 p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
