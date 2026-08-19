'use client';

import React from 'react';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-full font-bold uppercase tracking-wide shadow-md shadow-[var(--primary)]/20 active:scale-[0.98]',
  secondary:
    'bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] rounded-full font-bold uppercase tracking-wide active:scale-[0.98]',
  ghost:
    'text-[var(--foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--surface-hover)] rounded-full font-bold uppercase tracking-wide active:scale-[0.98]',
  danger:
    'bg-[var(--error)] text-white hover:opacity-90 rounded-full font-bold uppercase tracking-wide active:scale-[0.98]',
  accent:
    'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 rounded-full font-bold uppercase tracking-wide shadow-md shadow-[var(--accent)]/20 active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const spinnerSizeMap: Record<ButtonSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/50',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && (
        <Spinner
          size={spinnerSizeMap[size]}
          className={variant === 'secondary' || variant === 'ghost' ? 'text-[var(--foreground)]' : 'text-current'}
        />
      )}
      {children}
    </button>
  );
}
