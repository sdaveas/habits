/**
 * Button atom component
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps): JSX.Element {
  const baseClasses = 'px-6 py-2.5 border rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white',
    secondary: 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white',
    danger: 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

