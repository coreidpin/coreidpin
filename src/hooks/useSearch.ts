import { useState, useCallback, useEffect, useMemo } from 'react';
import { fuzzySearch, SearchableItem, SearchHistory, debounce } from '../utils/searchUtils';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  saveHistory?: boolean;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchableItem[];
  isSearching: boolean;
  history: string[];
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
}

/**
 * Hook for search functionality with debouncing and history
 */
export function useSearch(
  items: SearchableItem[],
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    saveHistory = true
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    if (saveHistory) {
      setHistory(SearchHistory.get());
    }
  }, [saveHistory]);

  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    setIsSearching(true);

    if (!searchQuery || searchQuery.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const searchResults = fuzzySearch(items, searchQuery, {
      threshold: 0.3,
      limit: 20
    });

    setResults(searchResults);
    setIsSearching(false);

    // Add to history
    if (saveHistory && searchQuery.trim().length >= minQueryLength) {
      SearchHistory.add(searchQuery);
      setHistory(SearchHistory.get());
    }
  }, [items, minQueryLength, saveHistory]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(performSearch, debounceMs),
    [performSearch, debounceMs]
  );

  // Update query and trigger search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  // Clear history
  const clearHistory = useCallback(() => {
    SearchHistory.clear();
    setHistory([]);
  }, []);

  // Remove from history
  const removeFromHistory = useCallback((queryToRemove: string) => {
    SearchHistory.remove(queryToRemove);
    setHistory(SearchHistory.get());
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    history,
    clearHistory,
    removeFromHistory
  };
}

/**
 * Hook for managing filters
 */
export interface Filter {
  id: string;
  value: any;
}

interface UseFiltersReturn<T> {
  filters: Record<string, any>;
  setFilter: (id: string, value: any) => void;
  clearFilter: (id: string) => void;
  clearAllFilters: () => void;
  filteredData: T[];
  activeFilterCount: number;
}

export function useFilters<T>(
  data: T[],
  filterFn: (item: T, filters: Record<string, any>) => boolean
): UseFiltersReturn<T> {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const setFilter = useCallback((id: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  const clearFilter = useCallback((id: string) => {
    setFilters(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => filterFn(item, filters));
  }, [data, filters, filterFn]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => 
      v !== null && v !== undefined && v !== '' && 
      (!Array.isArray(v) || v.length > 0)
    ).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredData,
    activeFilterCount
  };
}
