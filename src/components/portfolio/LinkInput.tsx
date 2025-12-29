/**
 * LinkInput Component
 * Input field for URLs with validation and preview
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LinkInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  validate?: boolean;
  showPreview?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const LinkInput: React.FC<LinkInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'https://example.com',
  validate = true,
  showPreview = false,
  required = false,
  disabled = false,
  className,
  error: externalError
}) => {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);

  // URL validation
  const validateUrl = (url: string): boolean => {
    if (!url) return !required;
    
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Extract domain for favicon
  const getDomain = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  // Update validation when value changes
  useEffect(() => {
    if (validate && touched) {
      setIsValid(validateUrl(value));
    }
  }, [value, validate, touched, required]);

  // Fetch favicon when URL is valid
  useEffect(() => {
    const domain = getDomain(value);
    if (domain && isValid) {
      setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
    } else {
      setFavicon(null);
    }
  }, [value, isValid]);

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      setIsValid(validateUrl(value));
    }
  };

  const showError = touched && !isValid;
  const error = externalError || (showError ? 'Please enter a valid URL' : '');

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Favicon/Globe Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="h-4 w-4"
              onError={() => setFavicon(null)}
            />
          ) : (
            <Globe className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Input Field */}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2 border rounded-lg text-sm transition-all',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
            showError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            !showError && touched && 'border-green-300',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
        />

        {/* Validation Icon */}
        {touched && validate && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* URL Preview */}
      {showPreview && value && isValid && (
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          Preview link
          <ExternalLink className="h-3 w-3" />
        </motion.a>
      )}
    </div>
  );
};
