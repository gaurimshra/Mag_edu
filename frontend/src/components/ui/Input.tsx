'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className,
  required,
  ...rest
}: InputProps) {
  const id = useId();
  const inputId = rest.id || id;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={inputId}
        required={required}
        className={cn(
          'w-full px-5 py-4 text-sm font-medium rounded-full border-2 bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 transition-colors',
          error
            ? 'border-[var(--error)] text-[var(--error)] placeholder:text-[var(--error)] focus:outline-none focus:ring-4 focus:ring-[var(--error)]/20 focus:border-[var(--error)]'
            : 'border-[var(--border)] focus:outline-none focus:border-[var(--accent)]',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...rest}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-bold text-[var(--error)] mt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)]" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--foreground)] opacity-50 mt-1 font-medium">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
