/**
 * Input atom component
 */

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  error,
  className = '',
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-glow placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
          error 
            ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
});

