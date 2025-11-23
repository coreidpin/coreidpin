import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  invited_by: string;
}

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Invitation not found');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      // Check if already accepted
      if (data.status !== 'pending') {
        setError('This invitation has already been used');
        return;
      }

      setInvitation(data);
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to accept this invitation');
        navigate('/login?redirect=/admin/accept-invitation?token=' + token);
        return;
      }

      // Verify email matches
      if (user.email !== invitation.email) {
        toast.error('This invitation is for a different email address');
        return;
      }

      // Add user to admin_users
      const { error: adminError } = await (supabase as any)
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: invitation.role,
        });

      if (adminError) throw adminError;

      // Mark invitation as accepted
      const { error: updateError } = await (supabase as any)
        .from('admin_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Log the action
      await (supabase as any).from('admin_audit_logs').insert({
        action: 'accept_admin_invitation',
        actor_id: user.id,
        target: invitation.email,
        status: 'success',
        details: { role: invitation.role },
      });

      toast.success('Admin access granted! Redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast.error(err.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => navigate('/admin/dashboard')}
              className="mt-4 w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-600">
            <Mail className="h-6 w-6" />
            <CardTitle>Admin Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join as an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{invitation?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Role:</span>
              <span className="font-medium capitalize">
                {invitation?.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expires:</span>
              <span className="font-medium">
                {invitation && new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
