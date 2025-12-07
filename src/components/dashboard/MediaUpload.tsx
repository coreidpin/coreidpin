import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface MediaUploadProps {
  userId: string;
  projectId?: string;
  existingUrls?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function MediaUpload({
  userId,
  projectId,
  existingUrls = [],
  onChange,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingUrls);

  const uploadFile = useCallback(async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${projectId || 'temp'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('project-media')
      .getPublicUrl(filePath);

    return publicUrl;
  }, [userId, projectId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + mediaUrls.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(f => !acceptedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(uploadFile);
      const newUrls = await Promise.all(uploadPromises);
      const updatedUrls = [...mediaUrls, ...newUrls];
      
      setMediaUrls(updatedUrls);
      onChange(updatedUrls);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeMedia = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    onChange(updated);
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || mediaUrls.length >= maxFiles}
          onClick={() => document.getElementById('media-upload')?.click()}
          className="bg-white text-black border-2 border-black hover:bg-gray-100"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <span className="text-sm text-gray-500">
          {mediaUrls.length}/{maxFiles} images
        </span>
        <input
          id="media-upload"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Info */}
      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP • Max {maxFiles} images
      </p>

      {/* Media Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaUrls.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {mediaUrls.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No images uploaded yet</p>
          <p className="text-xs text-gray-500 mt-1">Click "Upload Images" to add media</p>
        </div>
      )}
    </div>
  );
}
