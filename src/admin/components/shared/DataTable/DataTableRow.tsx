import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableColumn } from './DataTableHeader';
import { cn } from '@/lib/utils';

interface DataTableRowProps<T = any> {
  row: T;
  columns: TableColumn<T>[];
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: (row: T) => void;
  className?: string;
}

export function DataTableRow<T extends { id: any }>({
  row,
  columns,
  selectable,
  selected,
  onSelect,
  onClick,
  className,
}: DataTableRowProps<T>) {
  const handleRowClick = () => {
    if (onClick) {
      onClick(row);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        'border-b border-gray-200 hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        selected && 'bg-blue-50',
        className
      )}
    >
      {selectable && (
        <td className="w-12 px-4 py-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      {columns.map((column) => {
        const value = (row as any)[column.key];
        return (
          <td
            key={column.key}
            className={cn('px-4 py-3 text-sm text-gray-900', column.className)}
          >
            {column.render ? column.render(value, row) : value}
          </td>
        );
      })}
    </tr>
  );
}
