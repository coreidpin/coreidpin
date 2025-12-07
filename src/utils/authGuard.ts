import { toast } from 'sonner';

export interface AuthState {
  isAuthenticated: boolean;
  hasToken: boolean;
  hasUserId: boolean;
  userType: string | null;
}

export function checkAuthState(): AuthState {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = !!localStorage.getItem('accessToken');
  const hasUserId = !!localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  return {
    isAuthenticated,
    hasToken,
    hasUserId,
    userType
  };
}

export function isValidAuthState(authState: AuthState): boolean {
  return authState.isAuthenticated && 
         authState.hasToken && 
         authState.hasUserId && 
         !!authState.userType;
}

export function clearInvalidAuth(): void {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
}

export function redirectToLogin(reason?: string): void {
  if (reason) {
    console.warn('Auth redirect reason:', reason);
    toast.error('Session expired. Please log in again.');
  }
  clearInvalidAuth();
  window.location.href = '/login';
}

export function validateDashboardAccess(): boolean {
  const authState = checkAuthState();
  
  if (!isValidAuthState(authState)) {
    console.error('Dashboard access denied:', authState);
    redirectToLogin('Invalid authentication state');
    return false;
  }
  
  return true;
}
