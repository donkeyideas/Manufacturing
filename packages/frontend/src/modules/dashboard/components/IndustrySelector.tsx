import { Factory, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { IndustryType, IndustryProfile } from '@erp/shared';
import { INDUSTRY_LIST } from '@erp/shared';
import { cn } from '@erp/ui';

interface IndustrySelectorProps {
  value: IndustryType;
  onChange: (type: IndustryType) => void;
  readOnly?: boolean;
}

export function IndustrySelector({ value, onChange, readOnly }: IndustrySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = INDUSTRY_LIST.find(p => p.id === value) ?? INDUSTRY_LIST[0];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (readOnly) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-2xs text-text-secondary">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: current.accentColor }} />
        {current.label}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-2xs text-text-secondary hover:bg-surface-2 transition-colors"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: current.accentColor }} />
        {current.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg border border-border bg-surface-1 shadow-lg py-1">
          {INDUSTRY_LIST.map((profile) => (
            <button
              key={profile.id}
              onClick={() => { onChange(profile.id); setOpen(false); }}
              className={cn(
                'flex items-start gap-2.5 w-full px-3 py-2 text-left hover:bg-surface-2 transition-colors',
                profile.id === value && 'bg-surface-2'
              )}
            >
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: profile.accentColor }}
              />
              <div>
                <p className="text-xs font-medium text-text-primary">{profile.label}</p>
                <p className="text-2xs text-text-muted">{profile.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
