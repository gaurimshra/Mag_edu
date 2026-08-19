import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'math'
  | 'science'
  | 'progress'
  | 'warning'
  | 'risk'
  | 'neutral'
  | 'gold';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  math: 'bg-[#3B5BDB]/10 text-[#3B5BDB]',
  science: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  progress: 'bg-[var(--success)]/10 text-[var(--success)]',
  warning: 'bg-[var(--warning)]/10 text-[var(--warning)]',
  risk: 'bg-[var(--error)]/10 text-[var(--error)]',
  neutral: 'bg-[var(--surface-hover)] text-[var(--foreground)] opacity-80',
  gold: 'bg-[var(--accent)]/20 text-[var(--accent)]',
};

export default function Badge({
  variant = 'neutral',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
