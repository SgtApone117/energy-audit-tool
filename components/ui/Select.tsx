'use client';

import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  tooltip?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, hint, options, placeholder, tooltip, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <span>
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {tooltip}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-md shadow-subtle
            transition-all duration-250 bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            hover:border-gray-400
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-gray-400">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-secondary-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
