import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { supabase } from '../utils/supabase/client';
import {
  Shield,
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Eye,
  Briefcase,
  Award,
  Folder,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ConsentRequest {
  id: string;
  consent_token: string;
  professional_id: string;
  business_id: string;
  requested_scopes: string[];
  redirect_uri: string;
  state: string | null;
  status: string;
  expires_at: string;
  created_at: string;
  business_name?: string;
  business_logo?: string;
}

const SCOPE_DETAILS: Record<string, { label: string; description: string; icon: any }> = {
  basic: {
    label: 'Basic Profile',
    description: 'Name, headline, location, and profile picture',
    icon: User
  },
  work_history: {
    label: 'Work History',
    description: 'Your employment history and job titles',
    icon: Briefcase
  },
  projects: {
    label: 'Projects',
    description: 'Your professional projects and case studies',
    icon: Folder
  },
  skills: {
    label: 'Skills',
    description: 'Your listed skills and expertise',
    icon: Award
  },
  endorsements: {
    label: 'Endorsements',
    description: 'Endorsements from colleagues and connections',
    icon: CheckCircle2
  }
};

export function ConsentPage() {
  const { consent_token } = useParams<{ consent_token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [consentRequest, setConsentRequest] = useState<ConsentRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchConsent();
  }, [consent_token]);

  const checkAuthAndFetchConsent = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        const returnUrl = `/consent/${consent_token}`;
        navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }

      setIsAuthenticated(true);

      // Fetch consent request
      const { data, error: fetchError } = await supabase
        .from('consent_requests')
        .select(`
          *,
          business_profiles!consent_requests_business_id_fkey (
            company_name,
            logo_url
          )
        `)
        .eq('consent_token', consent_token)
        .single();

      if (fetchError || !data) {
        setError('Consent request not found or expired');
        return;
      }

      // Check if request belongs to current user
      if (data.professional_id !== user.id) {
        setError('This consent request is not for your account');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This consent request has expired');
        await supabase
          .from('consent_requests')
          .update({ status: 'expired' })
          .eq('consent_token', consent_token);
        return;
      }

      // Check if already processed
      if (data.status !== 'pending') {
        setError(`This consent request has already been ${data.status}`);
        return;
      }

      // Set business name and logo
      const businessData = data.business_profiles as any;
      setConsentRequest({
        ...data,
        business_name: businessData?.company_name || 'Unknown Business',
        business_logo: businessData?.logo_url
      });

      // Pre-select all requested scopes
      setSelectedScopes(data.requested_scopes);

    } catch (err: any) {
      console.error('Error fetching consent:', err);
      setError('Failed to load consent request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!consentRequest || selectedScopes.length === 0) {
      toast.error('Please select at least one permission to grant');
      return;
    }

    setProcessing(true);
    try {
      // Call backend callback endpoint
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/api-signin/callback?consent_token=${consent_token}&action=approve`,
        {
          method: 'GET',
          redirect: 'follow'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process consent');
      }

      // Backend will redirect to business's redirect_uri
      window.location.href = response.url;

    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error('Failed to approve consent');
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    setProcessing(true);
    try {
      // Call backend callback endpoint
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/api-signin/callback?consent_token=${consent_token}&action=deny`,
        {
          method: 'GET',
          redirect: 'follow'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deny consent');
      }

      // Backend will redirect to business's redirect_uri with error
      window.location.href = response.url;

    } catch (err: any) {
      console.error('Deny error:', err);
      toast.error('Failed to deny consent');
      setProcessing(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const timeRemaining = consentRequest
    ? Math.max(0, Math.floor((new Date(consentRequest.expires_at).getTime() - Date.now()) / 1000 / 60))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading consent request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Invalid Request</h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!consentRequest) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Authorization Request
            </h1>
            <p className="text-gray-600">
              A business wants to access your GidiPIN profile
            </p>
          </div>

          {/* Business Info Card */}
          <Card className="border-2 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {consentRequest.business_logo ? (
                    <img
                      src={consentRequest.business_logo}
                      alt={consentRequest.business_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {consentRequest.business_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    wants to access your professional information
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Expires in {timeRemaining} minutes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requested Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Requested Permissions
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                This business is requesting access to the following information:
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {consentRequest.requested_scopes.map((scope) => {
                const scopeInfo = SCOPE_DETAILS[scope] || {
                  label: scope,
                  description: 'Unknown permission',
                  icon: Info
                };
                const Icon = scopeInfo.icon;
                const isSelected = selectedScopes.includes(scope);

                return (
                  <div
                    key={scope}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleScope(scope)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleScope(scope)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {scopeInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {scopeInfo.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">You stay in control</p>
              <p>
                You can revoke this access at any time from your dashboard settings.
                {consentRequest.business_name} will only see the information you approve.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleDeny}
              variant="outline"
              disabled={processing}
              className="flex-1 h-12 text-base"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Access
                </>
              )}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing || selectedScopes.length === 0}
              className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Continue
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Protected by GidiPIN Security</p>
            <p>
              By approving, you agree to share the selected information with{' '}
              {consentRequest.business_name}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
