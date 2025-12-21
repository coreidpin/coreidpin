import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { UsersTable, UserProfile } from '../components/users/UsersTable';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Users } from 'lucide-react';
import { usersService } from '../services';
import { toast } from '../utils/toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/shared/DataTable/Pagination';
import { Button } from '../../components/ui/button';
import { Download } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, page, pageSize]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;

      const response = await usersService.getUsers(
        filters,
        { page, pageSize }
      );

      // Map service response to UI UserProfile type
      const mappedUsers: UserProfile[] = response.data.map((u: any) => ({
        id: u.id || u.user_id, // Fallback to user_id if id is missing
        email: u.email,
        // Generate a name from email if missing (e.g. 'john.doe@gmail.com' -> 'John Doe')
        full_name: u.full_name || (u.email ? u.email.split('@')[0].split(/[._]/).map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : '—'),
        // Fallback for user type, and explicit check for Super Admin
        user_type: (u.email === 'admin@gidipin.work' ? 'Super Admin' : (u.identity_type || u.user_type || 'Unspecified')) as any,
        status: u.is_suspended ? 'suspended' : 'active',
        created_at: u.created_at,
        avatar_url: u.avatar_url
      }));

      setUsers(mappedUsers);
      setTotal(response.total);
    } catch (error) {
      toast.handleError(error, 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSession');
    window.location.href = '/';
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <AdminLayout breadcrumbs={['Users', 'View Users']} onLogout={handleLogout}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: '#0A2540' }}>
              Users
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view all registered users
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-2">
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onChange={(e) => {
                        // Implement filter logic
                        const status = e.target.value ? [e.target.value] : undefined;
                        // @ts-ignore
                        fetchUsers({ status });
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onChange={(e) => {
                         const identityType = e.target.value ? [e.target.value] : undefined;
                         // @ts-ignore
                         fetchUsers({ identityType });
                      }}
                    >
                      <option value="">All Types</option>
                      <option value="professional">Professional</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                </div>

                {/* Export Button */}
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Simple CSV Export
                    const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'Joined'];
                    const csvContent = [
                      headers.join(','),
                      ...users.map(u => [
                        u.id, 
                        `"${u.full_name}"`, 
                        u.email, 
                        u.user_type, 
                        u.status, 
                        new Date(u.created_at).toLocaleDateString()
                      ].join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {!isLoading && users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description={searchQuery ? "No users match your search criteria" : "There are no users yet"}
                  action={searchQuery ? {
                    label: "Clear Search",
                    onClick: () => setSearchQuery('')
                  } : undefined}
                />
              ) : (
                <>
                  <UsersTable 
                    users={users} 
                    isLoading={isLoading} 
                    onViewUser={handleViewUser} 
                  />
                  <Pagination 
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <UserDetailModal 
            user={selectedUser} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onUserUpdated={fetchUsers}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
