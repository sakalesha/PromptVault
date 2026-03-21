import * as React from 'react';
import { diffWordsWithSpace } from 'diff';
import { cn } from '../utils/cn';

interface DiffViewProps {
  oldText: string;
  newText: string;
  className?: string;
}

export function DiffView({ oldText, newText, className }: DiffViewProps) {
  const diff = diffWordsWithSpace(oldText, newText);

  return (
    <div className={cn("font-mono text-sm leading-relaxed p-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden", className)}>
      <div className="flex flex-wrap gap-x-0.5 gap-y-1">
        {diff.map((part, index) => {
          const color = part.added 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
            : part.removed 
              ? 'bg-red-500/20 text-red-400 border-red-500/30 line-through' 
              : 'text-zinc-400';

          return (
            <span
              key={index}
              className={cn(
                "px-0.5 rounded transition-colors duration-200",
                part.added || part.removed ? "border px-1" : "",
                color
              )}
            >
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
