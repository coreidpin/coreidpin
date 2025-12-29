import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Folder, Star, Activity } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { SearchableItem } from '../utils/searchUtils';
import { cn } from '../lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchableItem[];
  onSelectItem: (item: SearchableItem) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    query,
    setQuery,
    results,
    isSearching,
    history,
    removeFromHistory
  } = useSearch(items, {
    debounceMs: 200,
    minQueryLength: 1,
    saveHistory: true
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < (results.length || history.length) - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          const displayItems = query ? results : history.map(h => ({
            id: h,
            title: h,
            type: 'other' as const
          }));
          if (displayItems[selectedIndex]) {
            if (query) {
              onSelectItem(displayItems[selectedIndex] as SearchableItem);
            } else {
              setQuery(displayItems[selectedIndex].title);
            }
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, history, selectedIndex, query, onSelectItem, onClose, setQuery]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return Folder;
      case 'endorsement': return Star;
      case 'activity': return Activity;
      default: return Search;
    }
  };

  const displayItems = query ? results : history.map(h => ({
    id: h,
    title: h,
    type: 'history' as const,
    description: 'Recent search'
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Search Modal */}
          <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl mx-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects, endorsements, activities..."
                    className="flex-1 outline-none text-base placeholder:text-gray-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : displayItems.length > 0 ? (
                    <div className="py-2">
                      {!query && history.length > 0 && (
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Recent Searches
                        </div>
                      )}
                      {query && results.length > 0 && (
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {results.length} Result{results.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {displayItems.map((item, index) => {
                        const Icon = item.type === 'history' ? Clock : getIcon(item.type);
                        const isHistory = item.type === 'history';

                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => {
                              if (isHistory) {
                                setQuery(item.title);
                              } else {
                                onSelectItem(item as SearchableItem);
                                onClose();
                              }
                            }}
                            className={cn(
                              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                              selectedIndex === index
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            )}
                          >
                            <div className={cn(
                              'p-2 rounded-lg flex-shrink-0',
                              selectedIndex === index
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {item.title}
                              </div>
                              {item.description && (
                                <div className="text-sm text-gray-500 truncate">
                                  {item.description}
                                </div>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {item.tags.slice(0, 3).map(tag => (
                                    <span
                                      key={tag}
                                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {isHistory && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromHistory(item.title);
                                }}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
                              >
                                <X className="h-3 w-3 text-gray-400" />
                              </button>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : query ? (
                    <div className="px-4 py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No results found</p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search query
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">Start typing to search</p>
                      <p className="text-sm text-gray-500">
                        Search across projects, endorsements, and activities
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↓</kbd>
                      to navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
                      to select
                    </span>
                  </div>
                  <span>Cmd+K to open</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
