import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle2, Download } from 'lucide-react';
import { VerificationBadgeDownloadable } from '../ui/VerificationBadge';
import html2canvas from 'html2canvas';

interface BadgeDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  userName: string;
}

export function BadgeDownloadModal({ open, onOpenChange, jobTitle, userName }: BadgeDownloadModalProps) {
  const badgeRef = useRef<HTMLDivElement>(null);

  const downloadBadge = async (format: 'png' | 'jpg') => {
    if (!badgeRef.current) return;

    try {
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: format === 'png' ? null : '#ffffff',
        scale: 2, // Higher quality
      });

      const link = document.createElement('a');
      link.download = `gidipin-verified-${jobTitle.toLowerCase().replace(/\s+/g, '-')}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    } catch (error) {
      console.error('Failed to download badge:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Download Your Verification Badge</DialogTitle>
          <DialogDescription>
            Share your professional verification on LinkedIn, Twitter, or your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Badge Preview */}
          <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
            <div ref={badgeRef}>
              <VerificationBadgeDownloadable jobTitle={jobTitle} name={userName} />
            </div>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PNG - Transparent */}
            <Button
              onClick={() => downloadBadge('png')}
              variant="outline"
              className="h-auto p-4 flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
            >
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <p className="font-semibold text-base">PNG (Transparent)</p>
                <p className="text-xs text-gray-500">Perfect for websites & portfolios</p>
              </div>
            </Button>

            {/* JPG - Social Media */}
            <Button
              onClick={() => downloadBadge('jpg')}
              variant="outline"
              className="h-auto p-4 flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
            >
              <Download className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <p className="font-semibold text-base">JPG (Social Media)</p>
                <p className="text-xs text-gray-500">LinkedIn, Twitter, Instagram</p>
              </div>
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 How to use:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Share on LinkedIn as a milestone post</li>
              <li>• Add to your email signature</li>
              <li>• Display on your portfolio or website</li>
              <li>• Post on Twitter to showcase your verification</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
