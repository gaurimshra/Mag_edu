'use client';

import React, { useEffect, useState } from 'react';

type MasterySubject = 'math' | 'science' | 'neutral';

interface MasteryBarProps {
  label: string;
  percentage: number;
  subject?: MasterySubject;
  showLabel?: boolean;
}

const fillColors: Record<MasterySubject, string> = {
  math:    '#3B5BDB',
  science: '#2F9E44',
  neutral: '#1A1C18',
};

export default function MasteryBar({
  label,
  percentage,
  subject = 'neutral',
  showLabel = true,
}: MasteryBarProps) {
  // Clamp percentage to valid range
  const clamped = Math.min(100, Math.max(0, percentage));

  // Animate from 0 → clamped on mount
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Tiny delay so the CSS transition is visible
    const raf = requestAnimationFrame(() => {
      setWidth(clamped);
    });
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#1A1C18]">{label}</span>
          <span className="text-sm text-[#6B6E66]">{clamped}%</span>
        </div>
      )}

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: '#F2F1EE' }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} mastery: ${clamped}%`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: fillColors[subject],
            transition: 'width 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}
