/**
 * useFeatureGate Hook - Check user's feature access based on profile completion
 * 
 * Queries the user_feature_access view to determine which premium features
 * the user can access based on their profile completion percentage.
 * 
 * Week 4, Day 19
 */

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

interface FeatureAccess {
  canAccessApiKeys: boolean;
  canAccessWebhooks: boolean;
  canAccessAdvancedAnalytics: boolean;
  profileCompletionPercentage: number;
  missingFields: string[];
  userId: string;
}

interface UseFeatureGateResult {
  access: FeatureAccess | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check user's feature access
 * 
 * @returns Feature access information, loading state, and refetch function
 * 
 * @example
 * ```tsx
 * const { access, loading } = useFeatureGate();
 * 
 * if (loading) return <LoadingSpinner />;
 * 
 * return (
 *   <FeatureLock
 *     isUnlocked={access?.canAccessApiKeys || false}
 *     currentCompletion={access?.profileCompletionPercentage || 0}
 *     requiredCompletion={80}
 *     featureName="API Keys"
 *   >
 *     <APIKeysManager />
 *   </FeatureLock>
 * );
 * ```
 */
export function useFeatureGate(): UseFeatureGateResult {
  const [access, setAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check user type from localStorage FIRST (before auth check)
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      
      // Business users get full access immediately (they use custom OTP auth, not Supabase auth)
      if (userType === 'business' && userId) {
        console.log('✅ Business user detected - granting full access (bypassing Supabase auth)');
        setAccess({
          canAccessApiKeys: true,
          canAccessWebhooks: true,
          canAccessAdvancedAnalytics: true,
          profileCompletionPercentage: 100,
          missingFields: [],
          userId: userId,
        });
        return;
      }

      // For professional users, use Supabase auth
      console.log('🔐 Getting user from Supabase auth (professional user)...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User error:', userError);
        throw userError;
      }
      if (!user) {
        console.error('❌ No user found');
        throw new Error('Not authenticated');
      }

      // Query user_feature_access view (for professionals)
      const { data, error: viewError } = await supabase
        .from('user_feature_access')
        .select('*')
        .eq('user_id', user.id)
        .single<any>();

      if (viewError) {
        // If view doesn't exist or no data, fall back to querying profile directly
        console.warn('user_feature_access view error, falling back to profile:', viewError);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completion_percentage, user_id')
          .eq('user_id', user.id)
          .single<any>();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');

        const completion = profile.profile_completion_percentage as number || 0;

        setAccess({
          canAccessApiKeys: completion >= 80,
          canAccessWebhooks: completion >= 100,
          canAccessAdvancedAnalytics: completion >= 80,
          profileCompletionPercentage: completion,
          missingFields: [], // Can't determine without view
          userId: user.id,
        });
      } else if (data) {
        setAccess({
          canAccessApiKeys: data.can_access_api_keys as boolean,
          canAccessWebhooks: data.can_access_webhooks as boolean,
          canAccessAdvancedAnalytics: data.can_access_advanced_analytics as boolean,
          profileCompletionPercentage: data.profile_completion_percentage as number,
          missingFields: (data.missing_fields as string[]) || [],
          userId: user.id,
        });
      }
    } catch (err) {
      console.error('Failed to check feature access:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // On error, deny all access
      setAccess({
        canAccessApiKeys: false,
        canAccessWebhooks: false,
        canAccessAdvancedAnalytics: false,
        profileCompletionPercentage: 0,
        missingFields: [],
        userId: '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchAccess();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    access,
    loading,
    error,
    refetch: fetchAccess,
  };
}

/**
 * Hook to check a specific feature access
 * 
 * @param feature - The feature to check ('apiKeys' | 'webhooks' | 'advancedAnalytics')
 * @returns Whether the user can access the feature
 * 
 * @example
 * ```tsx
 * const canAccess = useFeatureAccess('apiKeys');
 * 
 * if (!canAccess) {
 *   return <FeatureLockMessage />;
 * }
 * ```
 */
export function useFeatureAccess(
  feature: 'apiKeys' | 'webhooks' | 'advancedAnalytics'
): boolean {
  const { access, loading } = useFeatureGate();

  if (loading || !access) return false;

  switch (feature) {
    case 'apiKeys':
      return access.canAccessApiKeys;
    case 'webhooks':
      return access.canAccessWebhooks;
    case 'advancedAnalytics':
      return access.canAccessAdvancedAnalytics;
    default:
      return false;
  }
}

/**
 * Hook to get profile completion percentage
 * 
 * @returns Profile completion percentage (0-100)
 * 
 * @example
 * ```tsx
 * const completion = useProfileCompletion();
 * 
 * return <ProgressBar value={completion} />;
 * ```
 */
export function useProfileCompletion(): number {
  const { access, loading } = useFeatureGate();

  if (loading || !access) return 0;

  return access.profileCompletionPercentage;
}
