import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { UsersTable, UserProfile } from '../components/users/UsersTable';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { UserSearch } from '../components/users/UserSearch';
import { UserFilters, UserFilterOptions } from '../components/users/UserFilters';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users } from 'lucide-react';
import { usersService } from '../services';
import { analyticsService } from '../services/analytics.service';
import { toast } from '../utils/toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/shared/DataTable/Pagination';
import { Button } from '../../components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilterOptions>({});
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch users when search, filters, or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filters, page, pageSize]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Combine search and filters
      const combinedFilters: any = {
        ...filters,
        search: searchQuery || undefined
      };

      const response = await usersService.getUsers(
        combinedFilters,
        { page, pageSize }
      );

      // Map service response to UI UserProfile type
      const mappedUsers: UserProfile[] = response.data.map((u: any) => ({
        id: u.id || u.user_id, // Fallback to user_id if id is missing
        email: u.email,
        // Generate a name from email if missing
        full_name: u.full_name || u.name || (u.email ? u.email.split('@')[0].split(/[._]/).map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : '—'),
        // Fallback for user type, and explicit check for Super Admin
        user_type: (u.email === 'admin@gidipin.work' ? 'Super Admin' : (u.identity_type || u.user_type || 'Unspecified')) as any,
        status: u.status || (u.is_suspended ? 'suspended' : 'active'),
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on search
  }, []);

  const handleFiltersChange = useCallback((newFilters: UserFilterOptions) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  }, []);

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportUsers(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
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
              Manage and view all registered users ({total.toLocaleString()} total)
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Users</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <UserSearch
                  onSearch={handleSearch}
                  placeholder="Search by name, email, phone, or PIN..."
                />
                <UserFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
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
