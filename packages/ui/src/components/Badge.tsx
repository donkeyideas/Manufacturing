import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text-secondary',
        primary: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
