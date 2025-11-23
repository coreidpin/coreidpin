// Admin Type Definitions

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  userType: 'employer' | 'professional' | 'university';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  lastActive: string;
  metadata?: Record<string, any>;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  employers: number;
  professionals: number;
  universities: number;
  growthRate: number;
  verificationRate: number;
}

export interface AdminSession {
  isAdmin: boolean;
  adminId: string;
  sessionExpiry: number;
}

export interface AdminAction {
  type: 'verify' | 'reject' | 'suspend' | 'reactivate' | 'ban';
  userId: string;
  adminId: string;
  timestamp: string;
  reason?: string;
}
