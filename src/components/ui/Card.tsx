import * as React from 'react';
import { cn } from '@/src/utils/cn';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-bg-card border border-border-subtle rounded-2xl p-6 backdrop-blur-sm hover:border-border-strong transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
