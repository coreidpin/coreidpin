import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Check
} from 'lucide-react';
import { colors, spacing, shadows, borderRadius, typography } from '../styles/designSystem';

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

  const isLowCompletion = completion < 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border p-5 mb-8 overflow-hidden group"
      style={{
        backgroundColor: colors.white,
        borderColor: colors.neutral[200],
        boxShadow: shadows.sm,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLowCompletion ? 'bg-orange-50' : 'bg-blue-50'}`}>
              <Zap className={`w-5 h-5 ${isLowCompletion ? 'text-orange-500' : 'text-blue-500'}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 leading-tight">
                {completion < 50 ? `Complete your profile, ${userName}` : 'Almost there!'}
              </h4>
              <p className="text-sm text-gray-500">
                You're {completion}% of the way to a verified profile
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {missingFields.slice(0, 3).map((field, index) => (
              <Link 
                key={index}
                to="/dashboard/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <div className="w-1 h-1 rounded-full bg-gray-400" />
                {field}
              </Link>
            ))}
            {missingFields.length > 3 && (
              <span className="text-[11px] font-medium text-gray-400 py-1">
                +{missingFields.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 min-w-[200px]">
          <Link
            to="/dashboard/profile"
            className="w-full md:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#2d2a5d' }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-white font-bold text-xs transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#1e1b4b', letterSpacing: '0.025em' }}
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Identity Status
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: isLowCompletion ? colors.semantic.warning : colors.brand.primary[500] }}
          />
        </div>
        <span className="text-xs font-bold text-gray-900 tabular-nums min-w-[3ch]">
          {completion}%
        </span>
      </div>
    </motion.div>
  );
}

// Note: calculateProfileCompletion helper function removed and moved to src/utils/profileCompletion.ts
