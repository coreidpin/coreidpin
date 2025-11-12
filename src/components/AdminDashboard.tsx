import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  Users,
  Building,
  GraduationCap,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Mail,
  Eye,
  UserCheck,
  UserX,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Ban,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'employer' | 'professional' | 'university';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  lastActive: string;
  metadata?: any;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  employers: number;
  professionals: number;
  universities: number;
  growthRate: number;
  verificationRate: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingVerifications: 0,
    employers: 0,
    professionals: 0,
    universities: 0,
    growthRate: 0,
    verificationRate: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterType, filterStatus, users]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load mock data for demonstration
      // In production, this would fetch from Supabase
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'chioma.okonkwo@company.com',
          name: 'Chioma Okonkwo',
          userType: 'professional',
          status: 'active',
          verificationStatus: 'verified',
          createdAt: '2025-09-15',
          lastActive: '2025-10-04',
          metadata: { country: 'Nigeria', experience: 'Senior' }
        },
        {
          id: '2',
          email: 'hr@globaltech.com',
          name: 'GlobalTech Inc',
          userType: 'employer',
          status: 'active',
          verificationStatus: 'verified',
          createdAt: '2025-09-20',
          lastActive: '2025-10-03',
          metadata: { country: 'USA', employees: 500 }
        },
        {
          id: '3',
          email: 'admin@unilag.edu.ng',
          name: 'University of Lagos',
          userType: 'university',
          status: 'active',
          verificationStatus: 'verified',
          createdAt: '2025-08-10',
          lastActive: '2025-10-04',
          metadata: { country: 'Nigeria', students: 40000 }
        },
        {
          id: '4',
          email: 'adebayo.jones@email.com',
          name: 'Adebayo Jones',
          userType: 'professional',
          status: 'pending',
          verificationStatus: 'pending',
          createdAt: '2025-10-03',
          lastActive: '2025-10-04',
          metadata: { country: 'Nigeria', experience: 'Junior' }
        },
        {
          id: '5',
          email: 'recruit@techcorp.io',
          name: 'TechCorp Solutions',
          userType: 'employer',
          status: 'pending',
          verificationStatus: 'pending',
          createdAt: '2025-10-02',
          lastActive: '2025-10-04',
          metadata: { country: 'UK', employees: 150 }
        }
      ];

      setUsers(mockUsers);

      // Calculate stats
      const mockStats: PlatformStats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        pendingVerifications: mockUsers.filter(u => u.verificationStatus === 'pending').length,
        employers: mockUsers.filter(u => u.userType === 'employer').length,
        professionals: mockUsers.filter(u => u.userType === 'professional').length,
        universities: mockUsers.filter(u => u.userType === 'university').length,
        growthRate: 23.5,
        verificationRate: 87.3
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      // In production, update user verification status in Supabase
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, verificationStatus: 'verified' as const, status: 'active' as const }
          : user
      ));
      toast.success('User verified successfully');
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const handleRejectVerification = async (userId: string) => {
    try {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, verificationStatus: 'rejected' as const }
          : user
      ));
      toast.success('Verification rejected');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: 'suspended' as const }
          : user
      ));
      toast.success('User suspended');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: 'active' as const }
          : user
      ));
      toast.success('User reactivated');
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'employer':
        return <Building className="h-4 w-4" />;
      case 'professional':
        return <Users className="h-4 w-4" />;
      case 'university':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      suspended: 'destructive',
      banned: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' }> = {
      verified: { icon: <CheckCircle className="h-3 w-3 mr-1" />, variant: 'default' },
      pending: { icon: <Clock className="h-3 w-3 mr-1" />, variant: 'secondary' },
      rejected: { icon: <XCircle className="h-3 w-3 mr-1" />, variant: 'destructive' }
    };

    const { icon, variant } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, verifications, and platform operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{stats.growthRate}% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Pending Verifications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Verification Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.verificationRate}%</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +2.3% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* User Type Distribution */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Professionals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.professionals}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.professionals / stats.totalUsers) * 100).toFixed(1)}% of users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Employers</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.employers}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.employers / stats.totalUsers) * 100).toFixed(1)}% of users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Universities</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.universities}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.universities / stats.totalUsers) * 100).toFixed(1)}% of users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New user registration', user: 'Adebayo Jones', type: 'professional', time: '2 hours ago' },
                  { action: 'Verification approved', user: 'TechCorp Solutions', type: 'employer', time: '5 hours ago' },
                  { action: 'Credential issued', user: 'University of Lagos', type: 'university', time: '1 day ago' },
                  { action: 'Profile updated', user: 'Chioma Okonkwo', type: 'professional', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getUserTypeIcon(activity.type)}
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="User type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="university">Universities</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} of {users.length} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getUserTypeIcon(user.userType)}
                            <span className="text-sm capitalize">{user.userType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getVerificationBadge(user.verificationStatus)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>
                                  View and manage user information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-6">
                                  <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarFallback>
                                        {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h3 className="text-lg">{selectedUser.name}</h3>
                                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                      <div className="flex gap-2 mt-2">
                                        {getStatusBadge(selectedUser.status)}
                                        {getVerificationBadge(selectedUser.verificationStatus)}
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">User Type</p>
                                      <p className="text-sm capitalize">{selectedUser.userType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">User ID</p>
                                      <p className="text-sm font-mono text-xs">{selectedUser.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Created</p>
                                      <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Last Active</p>
                                      <p className="text-sm">{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="flex flex-wrap gap-2">
                                    {selectedUser.verificationStatus === 'pending' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleVerifyUser(selectedUser.id)}
                                        >
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Approve Verification
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRejectVerification(selectedUser.id)}
                                        >
                                          <UserX className="h-4 w-4 mr-2" />
                                          Reject Verification
                                        </Button>
                                      </>
                                    )}
                                    {selectedUser.status === 'active' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSuspendUser(selectedUser.id)}
                                      >
                                        <Ban className="h-4 w-4 mr-2" />
                                        Suspend User
                                      </Button>
                                    )}
                                    {selectedUser.status === 'suspended' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReactivateUser(selectedUser.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Reactivate User
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Email
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Message User
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verifications Tab */}
        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>
                Review and process user verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.filter(u => u.verificationStatus === 'pending').map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm">{user.name}</h4>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getUserTypeIcon(user.userType)}
                                {user.userType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Registered: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyUser(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectVerification(user.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers.filter(u => u.verificationStatus === 'pending').length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No pending verifications at this time. All caught up! 🎉
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Coming soon - Detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Platform configuration options will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
