import * as React from 'react';
import { cn } from '@/src/utils/cn';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-bg-card border border-border-strong rounded-xl px-4 py-2 text-sm text-text-heading placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all',
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full bg-bg-card border border-border-strong rounded-xl px-4 py-2 text-sm text-text-heading placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px] resize-none',
        className
      )}
      {...props}
    />
  );
}
