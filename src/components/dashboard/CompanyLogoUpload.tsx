import React, { useState, useRef } from 'react';
import { Upload, X, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface CompanyLogoUploadProps {
  companyName: string;
  currentLogoUrl?: string | null;
  onChange: (url: string | null) => void;
  userId: string;
}

export function CompanyLogoUpload({ 
  companyName, 
  currentLogoUrl, 
  onChange, 
  userId 
}: CompanyLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onChange(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (preview && preview.includes('company-logos')) {
      try {
        // Extract path from URL
        const path = preview.split('/company-logos/')[1];
        await supabase.storage.from('company-logos').remove([path]);
      } catch (error) {
        console.error('Error removing logo:', error);
      }
    }
    
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate initials from company name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview/Placeholder */}
      <div className="relative">
        {preview ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
            <img 
              src={preview} 
              alt={`${companyName} logo`}
              className="w-full h-full object-contain p-2"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              {companyName ? (
                <span className="text-xl font-bold text-gray-400">
                  {getInitials(companyName)}
                </span>
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, or SVG • Max 2MB
        </p>
      </div>
    </div>
  );
}
