import { useMemo } from 'react';
import { getFAQs } from '@erp/demo-data';
import { Accordion } from '@erp/ui';

export function FAQAccordion() {
  const faqs = useMemo(() => getFAQs(), []);

  const items = faqs.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: <p className="leading-relaxed">{faq.answer}</p>,
  }));

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-text-secondary">
            Everything you need to know about our manufacturing ERP platform.
          </p>
        </div>

        <Accordion items={items} />
      </div>
    </section>
  );
}
