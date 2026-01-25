import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  userManagementService,
  User,
  UserFilters,
  UserStatistics
} from '../services/user-management.service';

export function EnhancedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<UserFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters, page, sortBy, sortOrder]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await userManagementService.getUsers(
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder
      );
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await userManagementService.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      alert('Please select users first');
      return;
    }

    const userIds = Array.from(selectedUsers);
    const confirmMessage = `Are you sure you want to ${action} ${userIds.length} user(s)?`;
    
    if (!confirm(confirmMessage)) return;

    let result;
    switch (action) {
      case 'activate':
        result = await userManagementService.bulkUpdateStatus(userIds, true);
        break;
      case 'deactivate':
        result = await userManagementService.bulkUpdateStatus(userIds, false);
        break;
      case 'verify':
        result = await userManagementService.bulkUpdateVerification(userIds, 'verified');
        break;
      case 'reject':
        result = await userManagementService.bulkUpdateVerification(userIds, 'rejected');
        break;
      case 'delete':
        result = await userManagementService.bulkDeleteUsers(userIds);
        break;
      default:
        return;
    }

    if (result.success) {
      alert(result.message);
      setSelectedUsers(new Set());
      loadData();
      loadStatistics();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleExport = () => {
    if (users.length === 0) {
      alert('No users to export');
      return;
    }
    userManagementService.exportToCSV(users, 'users-export');
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleViewUser = async (user: User) => {
    try {
      setIsLoading(true);
      // Fetch full user details
      const fullDetails = await userManagementService.getUserDetails(user.id);
      if (fullDetails) {
        setSelectedUser(fullDetails);
        setShowUserModal(true);
      } else {
        alert('Failed to load user details');
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <Users className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium opacity-90">Total Users</p>
              <p className="text-4xl font-bold mt-2">{statistics.total_users.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <UserCheck className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium opacity-90">Active</p>
              <p className="text-4xl font-bold mt-2">{statistics.active_users.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <Shield className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium opacity-90">Verified</p>
              <p className="text-4xl font-bold mt-2">{statistics.verified_users.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <Users className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium opacity-90">This Week</p>
              <p className="text-4xl font-bold mt-2">{statistics.new_users_this_week.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">New users</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <UserX className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium opacity-90">Pending</p>
              <p className="text-4xl font-bold mt-2">{statistics.pending_verification.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">Verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof UserFilters]).length > 0 && (
                <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-semibold">
                  {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof UserFilters]).length}
                </span>
              )}
            </button>

            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={filters.user_type || ''}
                  onChange={(e) => handleFilterChange('user_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                <select
                  value={filters.verification_status || ''}
                  onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Active Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="Filter by country..."
                  value={filters.country || ''}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedUsers.size} user(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="h-4 w-4" />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
              >
                <XCircle className="h-4 w-4" />
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('verify')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              >
                <Shield className="h-4 w-4" />
                Verify
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Verification</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Profile</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${userManagementService.getUserTypeBadgeColor(user.user_type)}`}>
                          {userManagementService.getUserTypeDisplay(user.user_type, user.email)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${userManagementService.getStatusColor(user.verification_status)}`}>
                          {user.verification_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${user.profile_completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{user.profile_completion}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {user.country || 'N/A'}
                          {user.city && `, ${user.city}`}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {userManagementService.formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.full_name || 'N/A'}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${userManagementService.getUserTypeBadgeColor(selectedUser.user_type)}`}>
                      {userManagementService.getUserTypeDisplay(selectedUser.user_type, selectedUser.email)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${userManagementService.getStatusColor(selectedUser.verification_status)}`}>
                      {selectedUser.verification_status}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User Type</label>
                  <p className="text-gray-900 mt-1">{userManagementService.getUserTypeDisplay(selectedUser.user_type, selectedUser.email)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 mt-1">{selectedUser.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-gray-900 mt-1">{selectedUser.country || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-gray-900 mt-1">{selectedUser.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900 mt-1">{selectedUser.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Profile Completion</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedUser.profile_completion}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{selectedUser.profile_completion}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-gray-900 mt-1">{userManagementService.formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-gray-900 mt-1">{userManagementService.formatDate(selectedUser.last_login)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6 border-t">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default export for lazy loading
export default EnhancedUsers;
