import React from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface UserFilterOptions {
  userType?: string;
  status?: string;
  verified?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface UserFiltersProps {
  filters: UserFilterOptions;
  onFiltersChange: (filters: UserFilterOptions) => void;
  onClearFilters: () => void;
}

export function UserFilters({ filters, onFiltersChange, onClearFilters }: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof UserFilterOptions];
    if (key === 'dateRange') {
      const dateRange = value as { start?: string; end?: string };
      return dateRange?.start || dateRange?.end;
    }
    return value !== undefined && value !== '';
  }).length;

  const updateFilter = (key: keyof UserFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilter = (key: keyof UserFilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={isExpanded ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.userType && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.userType}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => clearFilter('userType')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => clearFilter('status')}
              />
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1">
              Verified: {filters.verified}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => clearFilter('verified')}
              />
            </Badge>
          )}
          {(filters.dateRange?.start || filters.dateRange?.end) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              Date Range
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => clearFilter('dateRange')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Options Expanded */}
      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* User Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User Type</label>
                <Select
                  value={filters.userType || ''}
                  onValueChange={(value) => updateFilter('userType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => updateFilter('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Verification</label>
                <Select
                  value={filters.verified || ''}
                  onValueChange={(value) => updateFilter('verified', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All users</SelectItem>
                    <SelectItem value="verified">Email Verified</SelectItem>
                    <SelectItem value="unverified">Not Verified</SelectItem>
                    <SelectItem value="has_pin">Has PIN</SelectItem>
                    <SelectItem value="no_pin">No PIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Signup Date</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="From"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value || undefined
                    })}
                  />
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="To"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value || undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
