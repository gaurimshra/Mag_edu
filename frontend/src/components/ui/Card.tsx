import React from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'sm' | 'md' | 'lg' | 'none';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  ...rest
}: CardProps) {
  const padClass = {
    none: 'p-0',
    sm: 'p-4 md:p-6',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  }[padding];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
        padClass,
        onClick ? 'cursor-pointer hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300' : '',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
