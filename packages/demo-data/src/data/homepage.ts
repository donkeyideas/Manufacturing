import type { Testimonial, PricingTier, FAQ, HomepageStats } from '@erp/shared';

const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Robert Martinez',
    title: 'VP of Operations',
    company: 'Precision Metal Works',
    quote: 'This ERP transformed our manufacturing operations. We reduced production lead times by 35% and virtually eliminated inventory discrepancies.',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Jennifer Liu',
    title: 'CFO',
    company: 'Advanced Composites Inc.',
    quote: 'The financial module is incredibly powerful. Automated payroll processing alone saved us 20 hours per month. The GL integration is seamless.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'David Thompson',
    title: 'Plant Manager',
    company: 'Summit Manufacturing',
    quote: 'The work order tracking and quality control modules give us real-time visibility into our entire production floor. Game changer.',
    rating: 5,
  },
  {
    id: 'test-4',
    name: 'Maria Santos',
    title: 'Director of Supply Chain',
    company: 'Global Parts Solutions',
    quote: 'Procurement automation reduced our PO processing time from days to minutes. The vendor management features are best-in-class.',
    rating: 4,
  },
  {
    id: 'test-5',
    name: 'Thomas Anderson',
    title: 'CEO',
    company: 'NovaTech Manufacturing',
    quote: 'We evaluated SAP, Oracle, and several others. This platform gave us enterprise-grade features at a fraction of the cost and implementation time.',
    rating: 5,
  },
  {
    id: 'test-6',
    name: 'Angela Brooks',
    title: 'HR Director',
    company: 'Sterling Fabrication',
    quote: 'The employee portal is a hit with our workforce. Clock in/out, pay stubs, leave requests — everything they need in one place.',
    rating: 5,
  },
];

const pricingTiers: PricingTier[] = [
  {
    id: 'tier-1',
    name: 'Starter',
    price: 99,
    period: 'month',
    features: [
      'Up to 25 users',
      'Core modules (Financial, Inventory, Sales)',
      'Basic reporting',
      'Email support',
      '5 GB storage',
      'Demo data included',
    ],
    isPopular: false,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'tier-2',
    name: 'Professional',
    price: 299,
    period: 'month',
    features: [
      'Up to 100 users',
      'All modules included',
      'Advanced analytics & reports',
      'AI Assistant',
      'Priority support',
      '50 GB storage',
      'API access',
      'Custom workflows',
    ],
    isPopular: true,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'tier-3',
    name: 'Enterprise',
    price: 0,
    period: 'month',
    features: [
      'Unlimited users',
      'All Professional features',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise deployment option',
      'Unlimited storage',
      'SLA guarantee',
      'White-label options',
      '24/7 phone support',
    ],
    isPopular: false,
    ctaText: 'Contact Sales',
  },
];

const faqs: FAQ[] = [
  { id: 'faq-1', question: 'How long does implementation take?', answer: 'Typical implementation takes 2-4 weeks for Starter, 4-8 weeks for Professional, and 8-16 weeks for Enterprise, depending on your customization needs and data migration complexity.', category: 'Getting Started', order: 1 },
  { id: 'faq-2', question: 'Can I migrate data from my current ERP?', answer: 'Yes. We provide migration tools and support for importing data from SAP, Oracle, QuickBooks, and custom systems. Our team handles the heavy lifting to ensure a smooth transition.', category: 'Getting Started', order: 2 },
  { id: 'faq-3', question: 'Is my data secure?', answer: 'Absolutely. We use bank-level encryption (AES-256), SOC 2 Type II compliance, and daily backups with point-in-time recovery. All data is stored in enterprise-grade data centers.', category: 'Security', order: 3 },
  { id: 'faq-4', question: 'Do you support multi-site manufacturing?', answer: 'Yes. Our platform supports multi-site operations with inter-plant transfers, consolidated reporting, and site-specific configurations while maintaining a unified view.', category: 'Features', order: 4 },
  { id: 'faq-5', question: 'What integrations are available?', answer: 'We integrate with QuickBooks, Stripe, Salesforce, ShipStation, Slack, and many more. Our API also supports custom integrations for any system.', category: 'Features', order: 5 },
  { id: 'faq-6', question: 'Can employees access the system on mobile?', answer: 'Yes. Our responsive design works on any device. The employee portal supports clock in/out, leave requests, and pay stub viewing from mobile browsers.', category: 'Features', order: 6 },
  { id: 'faq-7', question: 'How does the AI assistant work?', answer: 'Our AI assistant uses advanced language models to answer natural language questions about your data, generate reports, create SOPs, and provide actionable insights. It learns from your specific operations over time.', category: 'Features', order: 7 },
  { id: 'faq-8', question: 'What kind of support do you offer?', answer: 'Starter includes email support. Professional adds priority email and chat. Enterprise includes a dedicated account manager, 24/7 phone support, and guaranteed SLA response times.', category: 'Support', order: 8 },
  { id: 'faq-9', question: 'Is there a free trial?', answer: 'Yes! You can try any plan free for 14 days with full access to all features. No credit card required. You can also explore our interactive demo at any time.', category: 'Pricing', order: 9 },
  { id: 'faq-10', question: 'Can I cancel or change plans anytime?', answer: 'Yes. You can upgrade, downgrade, or cancel at any time. Changes take effect at the start of your next billing cycle. No cancellation fees.', category: 'Pricing', order: 10 },
];

const homepageStats: HomepageStats[] = [
  { label: 'Manufacturers', value: '500+', description: 'Companies trust our platform' },
  { label: 'Uptime', value: '99.9%', description: 'System reliability' },
  { label: 'Transactions', value: '50M+', description: 'Processed annually' },
  { label: 'Support', value: '24/7', description: 'Expert assistance' },
];

export function getTestimonials() {
  return testimonials;
}

export function getPricingTiers() {
  return pricingTiers;
}

export function getFAQs() {
  return faqs;
}

export function getHomepageStats() {
  return homepageStats;
}
