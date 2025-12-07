import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File, Shield, Award, FileCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface ProofDocument {
  url: string;
  filename: string;
  type: 'certificate' | 'offer_letter' | 'reference' | 'other';
  uploaded_at: string;
  size?: number;
}

interface ProofDocumentUploadProps {
  documents: ProofDocument[];
  onChange: (documents: ProofDocument[]) => void;
  userId: string;
  maxFiles?: number;
}

const DOCUMENT_TYPES = [
  { value: 'certificate', label: 'Certificate', icon: Award },
  { value: 'offer_letter', label: 'Offer Letter', icon: FileText },
  { value: 'reference', label: 'Reference Letter', icon: FileCheck },
  { value: 'other', label: 'Other', icon: File },
] as const;

export function ProofDocumentUpload({ 
  documents = [], 
  onChange, 
  userId,
  maxFiles = 5 
}: ProofDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<ProofDocument['type']>('certificate');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check max files limit
    if (documents.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        const validTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!validTypes.includes(file.type)) {
          throw new Error(`${file.name}: Invalid file type. Please upload PDF, JPG, PNG, or DOCX`);
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: File size must be less than 5MB`);
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${userId}/${Date.now()}_${sanitizedName}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('work-proofs')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('work-proofs')
          .getPublicUrl(data.path);

        return {
          url: publicUrl,
          filename: file.name,
          type: selectedType,
          uploaded_at: new Date().toISOString(),
          size: file.size
        };
      });

      const newDocuments = await Promise.all(uploadPromises);
      onChange([...documents, ...newDocuments]);
      toast.success(`${newDocuments.length} document(s) uploaded successfully`);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const doc = documents[index];
    
    // Remove from storage
    if (doc.url.includes('work-proofs')) {
      try {
        const path = doc.url.split('/work-proofs/')[1];
        await supabase.storage.from('work-proofs').remove([path]);
      } catch (error) {
        console.error('Error removing document:', error);
      }
    }

    // Update state
    const newDocuments = documents.filter((_, i) => i !== index);
    onChange(newDocuments);
    toast.success('Document removed');
  };

  const getIcon = (type: ProofDocument['type']) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.icon || File;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)}KB` : `${mb.toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {DOCUMENT_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || documents.length >= maxFiles}
          className="bg-white border-slate-200"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        PDF, JPG, PNG, or DOCX • Max 5MB per file • {documents.length}/{maxFiles} documents
      </p>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => {
            const Icon = getIcon(doc.type);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">
                        {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label}
                      </Badge>
                      {doc.size && (
                        <span className="text-xs text-slate-500">
                          {formatFileSize(doc.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Badge */}
      {documents.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">
            {documents.length} proof document{documents.length > 1 ? 's' : ''} attached
          </span>
        </div>
      )}
    </div>
  );
}
