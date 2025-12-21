import React, { useState } from 'react';
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
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mail, Calendar, Shield, Activity, User, Pencil, Trash, Save, X } from 'lucide-react';
import { usersService } from '../../services';
import { toast } from '../../utils/toast';

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export function UserDetailModal({ user, isOpen, onClose, onUserUpdated }: UserDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '' });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await usersService.updateUser(user.id, formData);
      toast.success('User profile updated successfully');
      setIsEditing(false);
      if (onUserUpdated) onUserUpdated();
    } catch (error) {
      toast.handleError(error, 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
    
    try {
      setIsLoading(true);
      await usersService.deleteUser(user.id);
      toast.success('User deleted successfully');
      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      toast.handleError(error, 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!user) return;
    const isSuspended = user.status === 'suspended';
    const action = isSuspended ? 'unsuspend' : 'suspend';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setIsLoading(true);
      await usersService.toggleUserSuspension(user.id, !isSuspended);
      toast.success(`User ${action}ed successfully`);
      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      toast.handleError(error, `Failed to ${action} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPIN = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to reset this user\'s PIN? They will need to set a new one.')) return;

    try {
      setIsLoading(true);
      await usersService.resetUserPIN(user.id);
      toast.success('User PIN reset successfully');
      if (onUserUpdated) onUserUpdated();
    } catch (error) {
      toast.handleError(error, 'Failed to reset PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await usersService.resendVerificationEmail(user.email);
      toast.success('Verification email sent');
    } catch (error) {
      toast.handleError(error, 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

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
                  {user.user_type && user.user_type !== 'Unspecified' && (
                    <Badge variant="outline" className="capitalize text-gray-700 border-gray-300">
                      {user.user_type}
                    </Badge>
                  )}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="actions" className="text-red-600 data-[state=active]:text-red-700">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                         <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile} disabled={isLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      {isEditing ? (
                        <Input 
                          value={formData.full_name} 
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-medium">{user.full_name || '—'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      {isEditing ? (
                         <Input 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-medium">{user.email}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">User ID</label>
                      <p className="text-sm font-mono bg-slate-100 p-2 rounded text-black border border-slate-200 select-all">
                        {user.id || '(No ID Found)'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Joined Date</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
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

              <TabsContent value="actions" className="mt-4 space-y-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Suspend User</p>
                        <p className="text-sm text-red-700">Prevents the user from logging in or using the API</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleSuspendUser}
                        disabled={isLoading}
                      >
                        {user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                      </Button>
                    </div>
                    
                    <div className="h-px bg-red-200" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Reset PIN</p>
                        <p className="text-sm text-red-700">Force user to set a new PIN on next login</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-900 hover:bg-red-100 hover:text-red-900"
                        onClick={handleResetPIN}
                        disabled={isLoading}
                      >
                        Reset PIN
                      </Button>
                    </div>

                    <div className="h-px bg-red-200" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete User</p>
                        <p className="text-sm text-red-700">Permanently remove users and all their data</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteUser}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete User
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Communication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Resend Verification Email</p>
                      <p className="text-sm text-gray-500">Send a new verification link to {user.email}</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                    >
                      Resend Email
                    </Button>
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
