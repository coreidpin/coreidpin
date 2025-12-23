/**
 * FeatureLock Component - Beautiful feature gating UI
 * 
 * Locks premium features behind profile completion requirements.
 * Shows progress, missing fields, and motivates completion.
 * 
 * Week 4, Day 19
 */

import React from 'react';
import { Lock, TrendingUp, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FeatureLockProps {
  isUnlocked: boolean;
  currentCompletion: number;
  requiredCompletion: number;
  featureName: string;
  missingFields?: string[];
  children: React.ReactNode;
  description?: string;
  profileUrl?: string;  // Custom URL for profile completion (e.g., /developer for business users)
}

export function FeatureLock({
  isUnlocked,
  currentCompletion,
  requiredCompletion,
  featureName,
  missingFields = [],
  children,
  description,
  profileUrl = '/dashboard/profile',
}: FeatureLockProps) {
  // If feature is unlocked, render children directly
  if (isUnlocked) {
    return <>{children}</>;
  }

  const remaining = requiredCompletion - currentCompletion;
  const progressPercentage = (currentCompletion / requiredCompletion) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        {/* Main Lock Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              {/* Animated Lock Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-lg"
              >
                <Lock className="w-10 h-10" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">
                {featureName} Locked
              </h2>
              <p className="text-white/90 text-lg">
                {description || `Complete ${requiredCompletion}% of your profile to unlock this premium feature`}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Profile Completion
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentCompletion}%
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-lg font-semibold text-gray-600">
                    {requiredCompletion}%
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>

              <p className="text-sm text-gray-500 mt-2 text-center">
                Just <span className="font-bold text-purple-600">{remaining}% more</span> to unlock this feature!
              </p>
            </div>

            {/* Missing Fields */}
            {missingFields && missingFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Complete These Fields
                    </h3>
                    <p className="text-sm text-blue-700">
                      Add the following information to increase your completion percentage
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {missingFields.map((field, index) => (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-2 text-sm text-blue-800 bg-white rounded-lg px-3 py-2 shadow-sm"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium capitalize">
                        {field.replace(/_/g, ' ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Benefits Section */}
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-start gap-3 mb-4">
                <Star className="w-6 h-6 text-purple-600 fill-current" />
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">
                    Why Complete Your Profile?
                  </h3>
                  <p className="text-sm text-purple-700">
                    Unlock premium features and stand out to businesses
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {[
                  'Access developer tools and API keys',
                  'Configure webhooks for integrations',
                  'View advanced analytics dashboard',
                  'Get priority in search results',
                ].map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-purple-800"
                  >
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              to={profileUrl}
              className="group relative w-full block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <TrendingUp className="w-5 h-5" />
                  <span>Complete Your Profile Now</span>
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    →
                  </motion.div>
                </div>
              </motion.div>
            </Link>

            <p className="text-center text-xs text-gray-500 mt-4">
              Takes just 2-3 minutes to complete
            </p>
          </div>
        </div>

        {/* Bottom Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          <p>
            🔒 Your data is secure and private. Complete your profile to unlock all features.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Compact version for inline feature locks (e.g., within a page)
 */
export function FeatureLockInline({
  isUnlocked,
  currentCompletion,
  requiredCompletion,
  featureName,
  children,
  profileUrl = '/dashboard/profile',
  onNavigateToSettings,
}: Omit<FeatureLockProps, 'missingFields' | 'description'> & {
  onNavigateToSettings?: () => void;
}) {
  if (isUnlocked) {
    return <>{children}</>;
  }

  const remaining = requiredCompletion - currentCompletion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{featureName} Locked</h3>
          <p className="text-sm text-gray-600">
            {remaining}% profile completion needed
          </p>
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentCompletion / requiredCompletion) * 100}%` }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
        />
      </div>

      {onNavigateToSettings ? (
        <button
          onClick={onNavigateToSettings}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm cursor-pointer"
        >
          <TrendingUp className="w-4 h-4" />
          Complete Profile
        </button>
      ) : (
        <Link
          to={profileUrl}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          Complete Profile
        </Link>
      )}
    </motion.div>
  );
}
