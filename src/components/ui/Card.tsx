import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden transition-all duration-200';

  const variants = {
    default:
      'border border-cyan-100/12 bg-black/42 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)]',
    gradient:
      'border border-cyan-100/12 bg-black/42 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)] [background-image:linear-gradient(135deg,rgba(240,106,18,0.08),transparent_50%,rgba(125,249,255,0.04))]',
    glass:
      'border border-ethereal-cyan/20 bg-black/38 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)]',
    bordered:
      'border border-magma-gold/35 bg-black/28 backdrop-blur-md shadow-[0_0_36px_rgba(247,198,90,0.06)]',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)] cursor-pointer'
    : '';

  return (
    <div
      className={clsx(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children || (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h3 className="alchemy-heading text-xl leading-tight mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-cyan-50/45">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </div>
  );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({ children, className, ...props }) => (
  <div className={clsx('text-cyan-50/72', className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => (
  <div
    className={clsx('mt-4 pt-4 border-t border-cyan-100/10', className)}
    {...props}
  >
    {children}
  </div>
);
