import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from './button';
import { supabase } from '../../utils/supabase/client';

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'document';
  uploading?: boolean;
  uploaded?: boolean;
}

interface MediaUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxSize = 10
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'document',
      uploading: true
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files
    for (const mediaFile of newFiles) {
      try {
        const fileExt = mediaFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `projects/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile.file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? { ...f, uploading: false, uploaded: true, url: publicUrl }
            : f
        ));

        onChange([...value, publicUrl]);
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.filter(f => f.id !== mediaFile.id));
      }
    }
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    maxFiles: maxFiles - value.length
  });

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.uploaded) {
      onChange(value.filter(url => url !== file.url));
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive 
            ? 'Drop files here...' 
            : 'Drag & drop files here, or click to select'
          }
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, {maxSize}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map(file => (
            <div key={file.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {file.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};