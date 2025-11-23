import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { DataTable } from '../shared/DataTable/DataTable';
import { TableColumn } from '../shared/DataTable/DataTableHeader';
import { settingsService, AdminUser } from '../../services/settings.service';
import { toast } from 'sonner';
import { Loader2, Plus, Mail } from 'lucide-react';
import { StatusBadge, StatusType } from '../shared/StatusBadge/StatusBadge';

export function AdminUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminUser['role']>('admin');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await settingsService.getAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await settingsService.inviteAdmin(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('admin');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const getStatusBadgeType = (status: AdminUser['status']): StatusType => {
    switch (status) {
      case 'active': return 'active';
      case 'invited': return 'pending';
      case 'suspended': return 'suspended';
      default: return 'inactive';
    }
  };

  const columns: TableColumn<AdminUser>[] = [
    {
      key: 'email',
      label: 'Email',
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className="capitalize">{value.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={getStatusBadgeType(value)}
        />
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value) => value ? new Date(value).toLocaleString() : 'Never',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Admin Users</h2>
          <p className="text-sm text-gray-500">Manage administrators and their roles.</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Administrator</DialogTitle>
              <DialogDescription>
                Send an invitation to a new administrator. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No admin users found."
      />
    </div>
  );
}
