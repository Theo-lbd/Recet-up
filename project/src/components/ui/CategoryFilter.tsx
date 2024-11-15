import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const CATEGORIES = [
  { value: 'all', label: 'Tout' },
  { value: 'soup', label: 'Soupes' },
  { value: 'starter', label: 'Entrées' },
  { value: 'main', label: 'Plats' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'other', label: 'Autres' }
] as const;

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isMobile?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onCategoryChange,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
              activeCategory === category.value
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <UtensilsCrossed size={14} className="mr-1.5" />
            {category.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeCategory === category.value
              ? 'bg-accent text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <UtensilsCrossed size={14} className="mr-1.5" />
          {category.label}
        </button>
      ))}
    </div>
  );
};