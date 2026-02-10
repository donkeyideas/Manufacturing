export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  avatarUrl?: string;
  rating: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  isPopular: boolean;
  ctaText: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface HomepageStats {
  label: string;
  value: string;
  description: string;
}
