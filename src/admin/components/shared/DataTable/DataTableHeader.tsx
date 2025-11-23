import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableHeaderProps {
  columns: TableColumn[];
  sortConfig?: {
    key: string;
    direction: SortDirection;
  };
  onSort?: (key: string) => void;
  selectable?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

export function DataTableHeader({
  columns,
  sortConfig,
  onSort,
  selectable,
  allSelected,
  onSelectAll,
}: DataTableHeaderProps) {
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <thead className="bg-gray-50 border-y border-gray-200">
      <tr>
        {selectable && (
          <th className="w-12 px-4 py-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            style={{ width: column.width }}
            className={cn(
              'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
              column.className
            )}
          >
            {column.sortable && onSort ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort(column.key)}
                className="h-auto p-0 hover:bg-transparent font-semibold text-gray-600"
              >
                {column.label}
                <span className="ml-2">{getSortIcon(column.key)}</span>
              </Button>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
