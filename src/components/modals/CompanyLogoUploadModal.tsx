import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { uploadCompanyLogo, autoFetchCompanyLogo } from '../../utils/companyLogos';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  employee_count?: number;
}

interface CompanyLogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  userId: string;
  onSuccess?: (logoUrl: string) => void;
}

export const CompanyLogoUploadModal: React.FC<CompanyLogoUploadModalProps> = ({
  isOpen,
  onClose,
  company,
  userId,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, SVG, or WebP image');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const logoUrl = await uploadCompanyLogo(company.id, selectedFile, userId);
      
      if (logoUrl) {
        setUploaded(true);
        toast.success(`${company.name} logo uploaded! All employees will see this.`);
        
        // Wait a moment to show success state
        setTimeout(() => {
          onSuccess?.(logoUrl);
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleAutoFetch = async () => {
    setAutoFetching(true);
    try {
      const logoUrl = await autoFetchCompanyLogo(company.name);
      
      if (logoUrl) {
        // Update company record
        const result = await uploadCompanyLogo(company.id, 
          await fetch(logoUrl).then(r => r.blob()).then(b => new File([b], 'logo.png')), 
          userId
        );
        
        if (result) {
          setUploaded(true);
          toast.success('Logo auto-fetched successfully!');
          setTimeout(() => {
            onSuccess?.(result);
            handleClose();
          }, 1500);
        }
      } else {
        toast.error('Could not auto-fetch logo. Please upload manually.');
      }
    } catch (error) {
      console.error('Auto-fetch error:', error);
      toast.error('Auto-fetch failed. Please upload manually.');
    } finally {
      setAutoFetching(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview('');
    setUploading(false);
    setAutoFetching(false);
    setUploaded(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Add {company.name} Logo
          </DialogTitle>
          <DialogDescription>
            {company.employee_count && company.employee_count > 1 
              ? `Help ${company.employee_count} ${company.name} employees have better profiles!`
              : `You're the first to add ${company.name}! Upload a logo to help all employees.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success State */}
          {uploaded && (
            <div className="flex flex-col items-center gap-4 p-8 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-green-900 mb-1">Logo Uploaded!</h3>
                <p className="text-sm text-green-700">
                  All {company.name} employees will now see this logo.
                </p>
              </div>
            </div>
          )}

          {/* Upload Interface */}
          {!uploaded && (
            <>
              {/* File Upload Area */}
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors rounded-lg p-8 text-center cursor-pointer"
                  onClick={() => document.getElementById('logo-upload-input')?.click()}
                >
                  {preview ? (
                    <div className="space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-lg border-2 border-gray-200 bg-white p-2 flex items-center justify-center overflow-hidden">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile!.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreview('');
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG, SVG or WebP (max 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-medium">Logo Guidelines:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>✓ Official company logo</li>
                      <li>✓ Square format preferred (1:1 ratio)</li>
                      <li>✓ Minimum 200x200px</li>
                      <li>✓ Clear and recognizable</li>
                      <li>✗ No watermarks or low quality images</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading || autoFetching}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  onClick={handleAutoFetch}
                  disabled={uploading || autoFetching}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {autoFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Try Auto-Fetch from Web
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleClose}
                  disabled={uploading || autoFetching}
                  variant="ghost"
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyLogoUploadModal;
