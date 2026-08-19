import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={['bg-[#E4E3DE] rounded animate-pulse', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = '' }: Pick<SkeletonProps, 'className'>) {
  return (
    <Skeleton
      className={['h-4 rounded', className].filter(Boolean).join(' ')}
    />
  );
}

export function SkeletonCard({ className = '' }: Pick<SkeletonProps, 'className'>) {
  return (
    <Skeleton
      className={['h-32 rounded-[14px]', className].filter(Boolean).join(' ')}
    />
  );
}
