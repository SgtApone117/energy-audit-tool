'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  tooltip?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, tooltip, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <span>
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {tooltip}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-md shadow-subtle
            transition-all duration-250
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            hover:border-gray-400
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
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

Input.displayName = 'Input';

export { Input };
export type { InputProps };
