/**
 * Portfolio Search & Filter Component
 * Advanced search across all portfolio items
 */

import React, { useState } from 'react';
import { Search, Filter, X, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface PortfolioSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableTags?: string[];
  className?: string;
}

export interface SearchFilters {
  query: string;
  type: 'all' | 'case_study' | 'engineering' | 'portfolio_item';
  tags: string[];
  featured: boolean;
  status?: string[];
}

export const PortfolioSearch: React.FC<PortfolioSearchProps> = ({
  onSearch,
  availableTags = [],
  className,
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    tags: [],
    featured: false,
    status: [],
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    const updatedFilters = { ...filters, query: newQuery };
    setFilters(updatedFilters);
    onSearch(newQuery, updatedFilters);
  };

  const toggleFilter = (filterType: keyof SearchFilters, value: any) => {
    let updatedFilters = { ...filters };

    if (filterType === 'tags') {
      const tags = filters.tags.includes(value)
        ? filters.tags.filter(t => t !== value)
        : [...filters.tags, value];
      updatedFilters = { ...filters, tags };
    } else if (filterType === 'featured') {
      updatedFilters = { ...filters, featured: !filters.featured };
    } else {
      updatedFilters = { ...filters, [filterType]: value };
    }

    setFilters(updatedFilters);
    onSearch(query, updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters: SearchFilters = {
      query: '',
      type: 'all',
      tags: [],
      featured: false,
      status: [],
    };
    setFilters(resetFilters);
    setQuery('');
    onSearch('', resetFilters);
  };

  const activeFilterCount = 
    (filters.type !== 'all' ? 1 : 0) +
    filters.tags.length +
    (filters.featured ? 1 : 0) +
    (filters.status?.length || 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects, case studies, skills..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
            showFilters || activeFilterCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          )}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Project Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['all', 'case_study', 'engineering', 'portfolio_item'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter('type', type)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filters.type === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter('tags', tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Featured Projects Only
            </label>
            <button
              onClick={() => toggleFilter('featured', !filters.featured)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                filters.featured ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  filters.featured ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filters.type.replace('_', ' ')}
              <button
                onClick={() => toggleFilter('type', 'all')}
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700">
              {tag}
              <button
                onClick={() => toggleFilter('tags', tag)}
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.featured && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Featured
              <button
                onClick={() => toggleFilter('featured', false)}
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
