/**
 * TagInput Component
 * Input field for adding/removing tags with autocomplete suggestions
 */

import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  suggestions = [],
  placeholder = 'Add a tag...',
  maxTags,
  className,
  disabled = false,
  label
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if backspace on empty input
      onRemove(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && (!maxTags || tags.length < maxTags)) {
      onAdd(tag);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => {
    onRemove(tag);
    inputRef.current?.focus();
  };

  const isMaxReached = maxTags && tags.length >= maxTags;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {maxTags && (
            <span className="ml-2 text-xs text-gray-500">
              ({tags.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Tags and Input Container */}
        <div
          className={cn(
            'min-h-[42px] px-3 py-2 border rounded-lg bg-white transition-all',
            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            'flex flex-wrap gap-2 items-center'
          )}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          {/* Existing Tags */}
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  disabled={disabled}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Input Field */}
          {!isMaxReached && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={disabled}
              placeholder={tags.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-sm disabled:cursor-not-allowed"
            />
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 group"
              >
                <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                <span>{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Max tags warning */}
      {isMaxReached && (
        <p className="text-xs text-amber-600">
          Maximum {maxTags} tags reached. Remove a tag to add more.
        </p>
      )}
    </div>
  );
};
