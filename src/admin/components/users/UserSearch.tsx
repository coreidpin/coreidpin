import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UserSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function UserSearch({ 
  onSearch, 
  placeholder = "Search by name, email, or PIN...",
  debounceMs = 500 
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      onSearch(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
