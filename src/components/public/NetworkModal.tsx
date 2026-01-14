import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { getFollowers, getFollowing, followUser, unfollowUser, isFollowing } from '../../lib/api/github-profile-features';
import { toast } from 'sonner';
import { UserPlus, UserCheck, Loader2, MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'followers' | 'following';
}

interface NetworkUser {
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  role?: string;
  city?: string;
  isFollowing?: boolean; // Client-side state
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  initialTab = 'followers' 
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // userId being acted on

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadNetwork(initialTab);
    }
  }, [isOpen, userId, initialTab]);

  const loadNetwork = async (type: 'followers' | 'following') => {
    try {
      setLoading(true);
      let data;
      if (type === 'followers') {
        const result = await getFollowers(userId);
        data = result?.map((r: any) => r.profiles) || [];
      } else {
        const result = await getFollowing(userId);
        data = result?.map((r: any) => r.profiles) || [];
      }

      // Check following status for each user
      // Optimization: In a real app, we'd batch this or load on demand
      const enriched = await Promise.all(data.map(async (u: any) => ({
        ...u,
        isFollowing: await isFollowing(u.user_id)
      })));

      setUsers(enriched);
    } catch (error) {
      console.error('Failed to load network:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser: NetworkUser) => {
    try {
      setActionLoading(targetUser.user_id);
      
      if (targetUser.isFollowing) {
        await unfollowUser(targetUser.user_id);
        toast.info(`Unfollowed ${targetUser.full_name}`);
      } else {
        await followUser(targetUser.user_id);
        toast.success(`Following ${targetUser.full_name}`);
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === targetUser.user_id 
          ? { ...u, isFollowing: !u.isFollowing }
          : u
      ));

    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const UserList = () => {
    if (loading) {
      return (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No {activeTab} found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 py-4">
        {users.map(user => (
          <div key={user.user_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.profile_picture_url} />
                <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">{user.full_name}</div>
                {user.role && (
                  <div className="text-xs text-gray-500">{user.role}</div>
                )}
                {user.city && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {user.city}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant={user.isFollowing ? "outline" : "default"}
              size="sm"
              className={user.isFollowing ? "text-gray-600" : "bg-black text-white hover:bg-gray-800"}
              onClick={() => handleFollowToggle(user)}
              disabled={actionLoading === user.user_id}
            >
              {actionLoading === user.user_id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : user.isFollowing ? (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Following
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Follow
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center pb-2">Network</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v as any);
            loadNetwork(v as any);
          }} 
          className="w-full h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="followers" className="mt-0">
               <UserList />
            </TabsContent>
            <TabsContent value="following" className="mt-0">
               <UserList />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
