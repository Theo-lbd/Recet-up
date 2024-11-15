import React from 'react';

interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
  label,
  active,
  onClick,
  disabled = false,
  compact = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center whitespace-nowrap ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      } rounded-full font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span className={`${compact ? 'mr-1' : 'mr-2'}`}>{icon}</span>
      {label}
    </button>
  );
};