import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending';
  created_at: string;
}

interface TeamManagerProps {
  businessId?: string;
}

export function TeamManager({ businessId }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchMembers();
    }
  }, [businessId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('business_members')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (!businessId) return;

    setInviting(true);
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('business_members')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', inviteEmail)
        .single();

      if (existing) {
        toast.error('User is already a team member');
        setInviting(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_members')
        .insert({
          business_id: businessId,
          email: inviteEmail,
          role: inviteRole,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setMembers([data, ...members]);
      setInviteEmail('');
      setShowInviteForm(false);
      toast.success(`Invitation sent to ${inviteEmail}`);
      
      // TODO: Trigger email function via Edge Function
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('business_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (!businessId) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center text-gray-500">
          Loading business profile...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Invite colleagues to manage your API keys and settings
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-gray-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg">Invite New Member</CardTitle>
              <CardDescription>Send an invitation to join your team</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={inviteMember} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-9 bg-white border-gray-200 text-gray-900"
                      required
                    />
                  </div>
                </div>
                <div className="w-40 space-y-2">
                  <Label htmlFor="role" className="text-gray-700">Role</Label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" disabled={inviting} className="bg-purple-600 hover:bg-purple-700">
                  {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Members List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date Added</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No team members yet. Invite someone above.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`w-3.5 h-3.5 ${member.role === 'admin' || member.role === 'owner' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-sm text-gray-700 capitalize">{member.role}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${member.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}
                          border-0 font-normal
                        `}
                      >
                        {member.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        <span className="capitalize">{member.status}</span>
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => removeMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
