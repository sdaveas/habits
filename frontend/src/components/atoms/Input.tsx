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
        <label className="block text-sm font-semibold text-black dark:text-white mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 border rounded bg-white dark:bg-black text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 focus:outline-none ${
          error 
            ? 'border-black dark:border-white' 
            : 'border-black dark:border-white'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-black dark:text-white font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

