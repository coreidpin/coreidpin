// Admin Module Entry Point
// This file exports all admin-related components, pages, and utilities

// Pages
export { AdminDashboard } from './pages/Dashboard';
export { UsersPage } from './pages/Users';
export { ProjectsPage } from './pages/Projects';
export { EndorsementsPage } from './pages/Endorsements';
export { AuthLogsPage } from './pages/logs/AuthLogs';
export { PINLoginLogsPage } from './pages/logs/PINLoginLogs';
export { EmailVerificationLogsPage } from './pages/logs/EmailVerificationLogs';
export { APIKeysPage } from './pages/integrations/APIKeys';

// Components
export { AdminLoginDialog } from './components/LoginDialog';

// Types
export type { AdminUser, PlatformStats } from './types/index';

// Utils
export { isAdmin, checkAdminAccess } from './utils/auth';
