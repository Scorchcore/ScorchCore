import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'border border-ethereal-cyan/55 bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white',
    secondary:
      'border border-cyan-100/12 bg-black/42 text-cyan-50/58 hover:border-ethereal-cyan/45 hover:text-cyan-50',
    danger:
      'border border-magma-orange/45 bg-magma-orange/8 text-magma-orange hover:border-magma-orange hover:bg-magma-orange/14',
    ghost:
      'text-cyan-50/58 hover:text-cyan-50 hover:bg-black/30',
    outline:
      'border border-ethereal-cyan/35 text-ethereal-cyan/80 hover:border-ethereal-cyan hover:text-ethereal-cyan hover:bg-cyan-300/8',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-2.5',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
