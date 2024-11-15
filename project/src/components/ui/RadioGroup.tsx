import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center"
          >
            <input
              type="radio"
              id={`${label}-${option.value}`}
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor={`${label}-${option.value}`}
              className="ml-3"
            >
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};