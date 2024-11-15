import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ACCENT_COLORS = [
  { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { name: 'emerald', label: 'Vert', class: 'bg-emerald-500' },
  { name: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { name: 'purple', label: 'Violet', class: 'bg-purple-500' },
  { name: 'red', label: 'Rouge', class: 'bg-red-500' },
  { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
] as const;

interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark';
  currentAccent: string;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onAccentChange: (color: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  currentAccent,
  onThemeChange,
  onAccentChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Thème</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`flex items-center justify-center p-4 border rounded-lg text-sm ${
              currentTheme === 'light'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Sun size={16} className="mr-2" />
            Clair
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`flex items-center justify-center p-4 border rounded-lg text-sm ${
              currentTheme === 'dark'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Moon size={16} className="mr-2" />
            Sombre
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Couleur d'accent</h3>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ name, label, class: bgClass }) => (
            <button
              key={name}
              type="button"
              onClick={() => onAccentChange(name)}
              className="relative"
              title={label}
            >
              <span className={`block w-8 h-8 rounded-full ${bgClass} transition-transform ${
                currentAccent === name 
                  ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 dark:ring-offset-gray-800 scale-110' 
                  : 'hover:scale-110'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};