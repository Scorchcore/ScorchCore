import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold uppercase tracking-[0.12em]';

  const variants = {
    default: 'border border-cyan-100/12 bg-black/30 text-cyan-50/42',
    success: 'border border-emerald-400/45 bg-emerald-500/8 text-emerald-300',
    warning: 'border border-magma-gold/55 bg-orange-500/14 text-magma-gold',
    danger:  'border border-magma-orange/45 bg-magma-orange/8 text-magma-orange',
    info:    'border border-ethereal-cyan/45 bg-cyan-300/8 text-ethereal-cyan/80',
    purple:  'border border-violet-400/35 bg-violet-500/8 text-violet-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.60rem] gap-1',
    md: 'px-2.5 py-0.5 text-[0.62rem] gap-1.5',
    lg: 'px-3 py-1 text-xs gap-2',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-cyan-50/30',
    success: 'bg-emerald-400',
    warning: 'bg-magma-gold',
    danger:  'bg-magma-orange',
    info:    'bg-ethereal-cyan',
    purple:  'bg-violet-400',
  };

  const dotSizes = { sm: 'h-1 w-1', md: 'h-1.5 w-1.5', lg: 'h-2 w-2' };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span className={clsx('rounded-full', dotSizes[size], dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
