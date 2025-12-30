/**
 * Mobile-Enhanced Search Overlay
 * Full-screen search experience for mobile
 */

import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  placeholder = 'Search projects, skills...',
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    onSearch(searchQuery);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <button
          onClick={() => handleSearch(query)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Design', 'Featured', 'Recent'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setQuery(filter);
                  handleSearch(filter);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
