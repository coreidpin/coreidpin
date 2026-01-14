import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { followUser, unfollowUser, isFollowing } from '../../lib/api/github-profile-features';

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUserName,
  variant = 'default',
  size = 'default',
  className = '',
  onFollowChange
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
   checkFollowingStatus();
  }, [targetUserId]);

  const checkFollowingStatus = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Don't allow following yourself
      if (user.id === targetUserId) {
        setLoading(false);
        return;
      }

      const status = await isFollowing(targetUserId);
      setFollowing(status);
    } catch (error) {
      console.error('Failed to check following status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      toast.error('Please log in to follow professionals');
      return;
    }

    if (currentUserId === targetUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setActionLoading(true);

      if (following) {
        await unfollowUser(targetUserId);
        setFollowing(false);
        toast.success(`Unfollowed ${targetUserName || 'user'}`);
        onFollowChange?.(false);
      } else {
        await followUser(targetUserId);
        setFollowing(true);
        toast.success(`Following ${targetUserName || 'user'}!`);
        onFollowChange?.(true);
      }
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setActionLoading(false);
    }
  };

  // Don't show button if viewing own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  // Don't show button if not logged in
  if (!currentUserId && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={following ? 'outline' : variant}
      size={size}
      className={className}
      onClick={handleToggleFollow}
      disabled={actionLoading}
    >
      {actionLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {following ? 'Unfollowing...' : 'Following...'}
        </>
      ) : following ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};
