import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileCompletionBannerProps {
  completion: number;
  missingFields: string[];
  userName?: string;
}

export function ProfileCompletionBanner({ 
  completion, 
  missingFields,
  userName = 'there'
}: ProfileCompletionBannerProps) {
  // Don't show if profile is 100% complete
  if (completion >= 100) return null;

  // Calculate urgency level
  const isLowCompletion = completion < 50;
  const isMediumCompletion = completion >= 50 && completion < 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-lg border-l-4 p-4 mb-6 shadow-sm
        ${isLowCompletion 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500' 
          : isMediumCompletion
          ? 'bg-gradient-to-r from-yellow-50 to-blue-50 border-yellow-500'
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500'
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {completion < 80 ? (
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
            )}
            <h4 className="font-semibold text-gray-900">
              {completion < 50 
                ? `Welcome ${userName}! Let's complete your profile`
                : completion < 80
                ? 'Almost there! Complete your profile'
                : 'Final touches for your profile'
              }
            </h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">{completion}% complete</span>
            {' • '}
            <span>{missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining</span>
          </p>

          {/* Missing fields preview (show first 3) */}
          {missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {missingFields.slice(0, 3).map((field, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-white/80 text-xs font-medium text-gray-700 border border-gray-200"
                >
                  {field}
                </span>
              ))}
              {missingFields.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/80 text-xs font-medium text-gray-500">
                  +{missingFields.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to="/dashboard/profile"
          className="
            px-4 py-2 rounded-lg font-medium text-sm
            bg-gradient-to-r from-blue-600 to-purple-600 
            text-white shadow-sm
            hover:from-blue-700 hover:to-purple-700
            transition-all duration-200
            hover:shadow-md hover:scale-105
            flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
          aria-label="Complete your profile"
        >
          Complete Profile
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completion}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`
            h-full
            ${isLowCompletion
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : isMediumCompletion
              ? 'bg-gradient-to-r from-yellow-500 to-blue-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }
          `}
        />
      </div>

      {/* Accessibility: Screen reader progress announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Profile is {completion}% complete. {missingFields.length} fields remaining.
      </div>
    </motion.div>
  );
}

// Note: calculateProfileCompletion helper function removed and moved to src/utils/profileCompletion.ts
