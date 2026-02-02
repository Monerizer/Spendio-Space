import React from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{title}</h3>
      <p className="text-[#666666] text-center max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
