import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div
          className="flex items-center justify-center rounded-full bg-[#F2F1EE]"
          style={{ width: 48, height: 48 }}
          aria-hidden="true"
        >
          <span className="text-[#6B6E66] flex items-center justify-center">
            {icon}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#1A1C18] mt-4">{title}</h3>

      {description && (
        <p className="text-sm text-[#6B6E66] mt-2 max-w-xs">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
