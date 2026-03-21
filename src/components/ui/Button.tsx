import * as React from 'react';
import { cn } from '@/src/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-text-heading text-bg-main hover:opacity-90 active:scale-95',
      secondary: 'bg-border-strong text-text-heading hover:bg-border-subtle active:scale-95',
      ghost: 'bg-transparent text-text-muted hover:text-text-heading hover:bg-border-subtle active:scale-95',
      danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95',
      outline: 'bg-transparent border border-border-strong text-text-heading hover:bg-border-subtle active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
