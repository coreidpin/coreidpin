import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { UserProfile } from './UsersTable';
import { Badge } from '../../../components/ui/badge';
import { Mail, Calendar, Shield, Activity, User } from 'lucide-react';

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View and manage user information
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-6 py-4">
          {/* User Header Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-medium text-gray-600">
                {user.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {user.user_type}
                  </Badge>
                  <Badge 
                    className={
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }
                  >
                    {user.status || 'active'}
                  </Badge>
                </div>
              </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded">{user.id}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Joined Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {/* Add more profile fields here as needed */}
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity recorded</p>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">PIN Status</p>
                        <p className="text-sm text-gray-500">Identity verification PIN</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
