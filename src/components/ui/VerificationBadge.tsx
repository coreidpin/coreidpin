import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  jobTitle: string;
  name?: string;
}

export function VerificationBadge({ jobTitle, name }: VerificationBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full">
      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
      <span className="text-sm font-semibold text-blue-900">
        Verified {jobTitle}
      </span>
    </div>
  );
}

// Downloadable version (for generating image)
export function VerificationBadgeDownloadable({ jobTitle, name }: VerificationBadgeProps) {
  return (
    <div 
      id="verification-badge-download"
      className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-2xl border-2 border-blue-200 shadow-lg"
      style={{ width: '600px' }}
    >
      {/* Badge */}
      <div className="flex items-center gap-3 px-6 py-3 bg-blue-600 rounded-full">
        <CheckCircle2 className="h-6 w-6 text-white" />
        <span className="text-xl font-bold text-white">
          VERIFIED
        </span>
      </div>

      {/* Job Title */}
      <p className="text-2xl font-bold text-gray-900">{jobTitle}</p>
      
      {/* Name */}
      {name && (
        <p className="text-lg text-gray-600">{name}</p>
      )}

      {/* GidiPIN Logo */}
      <div className="text-xs text-gray-400 font-semibold mt-2">
        GidiPIN Verified Professional
      </div>
    </div>
  );
}
