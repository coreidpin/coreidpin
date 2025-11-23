import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTableHeader, TableColumn, SortDirection } from './DataTableHeader';
import { DataTableRow } from './DataTableRow';
import { Pagination, PaginationConfig } from './Pagination';
import { cn } from '@/lib/utils';

export interface DataTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: Partial<PaginationConfig>;
  selectable?: boolean;
  selectedRows?: Set<any>;
  onRowSelect?: (id: any, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onRowClick?: (row: T) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  className?: string;
}

export function DataTable<T extends { id: any }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  selectable,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  onRowClick,
  onSort,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';

    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig(direction ? { key, direction } : null);

    if (onSort) {
      onSort(key, direction);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const allSelected = useMemo(() => {
    return data.length > 0 && data.every((row) => selectedRows.has(row.id));
  }, [data, selectedRows]);

  const handleSelectAll = (selected: boolean) => {
    if (onSelectAll) {
      onSelectAll(selected);
    }
  };

  const handleRowSelect = (id: any, selected: boolean) => {
    if (onRowSelect) {
      onRowSelect(id, selected);
    }
  };

  if (loading) {
    return (
      <div className={cn('rounded-lg border border-gray-200 overflow-hidden', className)}>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 overflow-hidden bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <DataTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
          />
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  selectable={selectable}
                  selected={selectedRows.has(row.id)}
                  onSelect={(selected) => handleRowSelect(row.id, selected)}
                  onClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page || 1}
          pageSize={pagination.pageSize || 10}
          total={pagination.total || data.length}
          onPageChange={pagination.onPageChange || (() => {})}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
