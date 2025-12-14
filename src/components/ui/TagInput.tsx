import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function TagInput({ label, value, onChange, placeholder = 'Type and press Enter', error }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag?: string) => {
    const trimmed = (tag || inputValue).trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-black font-medium">{label}</Label>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 sm:p-2 bg-gray-50 rounded-md border">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-gray-800 rounded-sm min-w-[24px] min-h-[24px] flex items-center justify-center -mr-1"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-black h-11 sm:h-9 text-base sm:text-sm pr-20"
          enterKeyHint="done"
        />
        
        {/* Mobile-friendly "Add" button */}
        {inputValue.trim() && (
          <Button
            type="button"
            size="sm"
            onClick={() => addTag()}
            className="absolute right-1 top-1 h-9 px-3 bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-600">
        Press Enter or comma to add. {value.length > 0 && 'Backspace to remove last.'}
      </p>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
