import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (key: string, value: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span className="text-xs">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key, filter.value)}
            className="ml-1 rounded-full hover:bg-slate-300 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
