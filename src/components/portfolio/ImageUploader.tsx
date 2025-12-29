/**
 * ImageUploader Component
 * Drag & drop image uploader with preview and Supabase storage integration
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { supabase } from '../../utils/supabase/client';

interface ImageUploaderProps {
  value?: string | string[]; // Single URL or array of URLs
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  maxSize?: number; // Max size in MB
  maxFiles?: number;
  accept?: string;
  bucket?: string; // Supabase storage bucket
  folder?: string; // Folder within bucket
  label?: string;
  disabled?: boolean;
  className?: string;
  preview?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'free';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  multiple = false,
  maxSize = 5, // 5MB default
  maxFiles = 10,
  accept = 'image/*',
  bucket = 'portfolio-images',
  folder = 'uploads',
  label,
  disabled = false,
  className,
  preview = true,
  aspectRatio = 'free'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrls = Array.isArray(value) ? value : value ? [value] : [];

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    free: ''
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');

    // Validate file count
    const newFilesCount = files.length;
    const existingCount = imageUrls.length;
    if (existingCount + newFilesCount > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSize}MB limit`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        onChange([...imageUrls, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [imageUrls, multiple, maxSize, maxFiles, onChange]);

  // Handle drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  // Remove image
  const removeImage = (url: string) => {
    if (multiple) {
      onChange(imageUrls.filter(u => u !== url));
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {imageUrls.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({imageUrls.length}/{maxFiles})
            </span>
          )}
        </label>
      )}

      {/* Upload Area */}
      {(imageUrls.length === 0 || multiple) && imageUrls.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all cursor-pointer',
            'hover:border-blue-400 hover:bg-blue-50/50',
            dragActive && 'border-blue-500 bg-blue-50',
            disabled && 'opacity-50 cursor-not-allowed',
            aspectRatioClasses[aspectRatio] || 'p-8'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Up to {maxSize}MB • {accept.replace('image/', '').toUpperCase()}
                  </p>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled || uploading}
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Previews */}
      {preview && imageUrls.length > 0 && (
        <div className={cn(
          'grid gap-3',
          multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
        )}>
          <AnimatePresence>
            {imageUrls.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <div className={cn(
                  'relative bg-gray-100',
                  aspectRatioClasses[aspectRatio] || 'aspect-video'
                )}>
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(url)}
                    disabled={disabled}
                    className={cn(
                      'absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full',
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      'hover:bg-red-600'
                    )}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Success Check */}
                  <div className="absolute bottom-2 right-2 p-1 bg-green-500 rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
