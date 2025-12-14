import React, { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Label } from './label';

interface DynamicListInputProps {
  label: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  helpText?: string;
  maxItems?: number;
  minRows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * DynamicListInput Component - For adding multiple text items (e.g., achievements)
 * Each item can be a multi-line text entry
 */
export function DynamicListInput({ 
  label, 
  items, 
  onItemsChange, 
  placeholder = 'Enter an item...',
  helpText,
  maxItems = 20,
  minRows = 2,
  maxLength = 500,
  className = ''
}: DynamicListInputProps) {
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    if (!newItem.trim()) {
      setError('Item cannot be empty');
      return;
    }

    if (items.length >= maxItems) {
      setError(`Maximum ${maxItems} items allowed`);
      return;
    }

    if (newItem.trim().length > maxLength) {
      setError(`Item must be ${maxLength} characters or less`);
      return;
    }

    onItemsChange([...items, newItem.trim()]);
    setNewItem('');
    setError(null);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
    setError(null);
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onItemsChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Add item on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      
      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 group">
              <div className="mt-2 flex-shrink-0">
                <GripVertical className="h-5 w-5 text-gray-300 group-hover:text-gray-400 cursor-move" />
              </div>
              <Textarea
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="flex-1 resize-none"
                rows={minRows}
                maxLength={maxLength}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                className="mt-2 flex-shrink-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item section */}
      {items.length < maxItems && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={newItem}
              onChange={(e) => {
                setNewItem(e.target.value);
                setError(null);
              }}
              placeholder={placeholder}
              className={`flex-1 resize-none ${error ? 'border-red-500' : ''}`}
              rows={minRows}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
            />
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="icon"
              className="flex-shrink-0 h-[76px]"
              disabled={!newItem.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          
          <p className="text-xs text-gray-500">
            Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to add • {items.length} / {maxItems} items
          </p>
        </div>
      )}

      {items.length >= maxItems && (
        <p className="text-xs text-amber-600">
          Maximum number of items reached ({maxItems})
        </p>
      )}
    </div>
  );
}
