import React from 'react';

interface SearchFilterProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent/10 text-accent'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </button>
  );
};