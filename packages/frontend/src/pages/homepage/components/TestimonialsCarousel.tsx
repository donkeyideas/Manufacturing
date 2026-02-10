import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getTestimonials } from '@erp/demo-data';
import { cn } from '@erp/ui';

export function TestimonialsCarousel() {
  const testimonials = useMemo(() => getTestimonials(), []);
  const [current, setCurrent] = useState(0);

  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Trusted by Manufacturers
            </h2>
            <p className="text-lg text-text-secondary">
              See what our customers have to say about transforming their operations.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-1 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-1 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500"
            style={{ transform: `translateX(-${current * (100 / visibleCount + 2)}%)` }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'flex-shrink-0 w-full md:w-[calc(33.333%-16px)] rounded-xl border border-border bg-surface-0 p-6'
                )}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-3'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-primary">{t.name}</div>
                    <div className="text-2xs text-text-muted">{t.title}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
