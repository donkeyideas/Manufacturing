import { HomepageNav } from './components/HomepageNav';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { StatsBar } from './components/StatsBar';
import { TestimonialsCarousel } from './components/TestimonialsCarousel';
import { PricingSection } from './components/PricingSection';
import { FAQAccordion } from './components/FAQAccordion';
import { CTASection } from './components/CTASection';
import { HomepageFooter } from './components/HomepageFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <HomepageNav />
      <HeroSection />
      <StatsBar />
      <FeaturesGrid />
      <TestimonialsCarousel />
      <PricingSection />
      <FAQAccordion />
      <CTASection />
      <HomepageFooter />
    </div>
  );
}
