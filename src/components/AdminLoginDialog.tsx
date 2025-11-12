import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@swipe.work',
  password: 'SwipeAdmin2025!'
};

export function AdminLoginDialog({ open, onOpenChange, onLoginSuccess }: AdminLoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Store admin session
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminSession', Date.now().toString());
      onLoginSuccess();
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            This area is restricted to authorized administrators only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@swipe.work"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-input-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">Demo Credentials</p>
                <p className="text-xs text-muted-foreground">
                  Email: <code className="bg-background px-1 py-0.5 rounded">admin@nwanne.com</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Password: <code className="bg-background px-1 py-0.5 rounded">NwanneAdmin2025!</code>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Lock className="h-4 w-4" />
                  </motion.div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-center text-destructive/80">
            ⚠️ All admin activities are logged and monitored for security purposes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
