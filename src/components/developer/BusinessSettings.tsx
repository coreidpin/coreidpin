import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { ensureValidSession } from '../../utils/session';
import {
  Building2,
  Globe,
  Mail,
  Save,
  Loader2
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  company_name: string;
  company_email: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  api_tier: string;
}

interface BusinessSettingsProps {
  businessId?: string;
  initialProfile?: any;
}

export function BusinessSettings({ businessId, initialProfile }: BusinessSettingsProps) {
  const [profile, setProfile] = useState<BusinessProfile>({
    id: '',
    company_name: '',
    company_email: '',
    website: '',
    description: '',
    industry: '',
    api_tier: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialProfile) {
        setProfile({
            id: initialProfile.id,
            company_name: initialProfile.company_name || '',
            company_email: initialProfile.company_email || '',
            website: initialProfile.website || '',
            description: initialProfile.description || '',
            industry: initialProfile.industry || '',
            api_tier: initialProfile.api_tier || 'free'
        });
    } else if (businessId) {
        fetchProfile();
    } else {
        // Fallback: Try to prefill from Auth Metadata if no business profile exists yet
        prefillFromAuth();
    }
  }, [businessId, initialProfile]);

  const prefillFromAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata) {
        const meta = user.user_metadata;
        // Use 'companyName' if available, otherwise 'name' (common in basic registration)
        const nameToUse = meta.companyName || meta.name || '';
        
        setProfile(prev => ({
            ...prev,
            company_name: nameToUse,
            company_email: meta.email || user.email || '',
            industry: meta.industry || '',
            website: meta.website || ''
        }));
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      if (data) {
        const profileData = data as any;
        setProfile({
            id: profileData.id,
            company_name: profileData.company_name || '',
            company_email: profileData.company_email || '',
            website: profileData.website || '',
            description: profileData.description || '',
            industry: profileData.industry || '',
            api_tier: profileData.api_tier || 'free'
        });
      }
    } catch (error) {
        console.error('Error fetching profile', error);
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
        // Get token directly from localStorage or Supabase
        const storedToken = localStorage.getItem('accessToken');
        
         if (!storedToken) {
            // Try ensuring valid session as fallback
            const token = await ensureValidSession();
            if (!token) {
                toast.error('Please log in to save settings');
                return;
            }
        }

        // Get userId directly from localStorage (custom OTP auth stores it there)
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('User ID not found. Please log in again.');
            return;
        }

        const updates = {
            user_id: userId,
            company_name: profile.company_name,
            company_email: profile.company_email,
            website: profile.website,
            description: profile.description,
            industry: profile.industry,
            api_tier: profile.api_tier,
            updated_at: new Date().toISOString()
        };

        // Use upsert to handle both create and update scenarios
        const { error } = await supabase
            .from('business_profiles')
            .upsert(updates as any, { onConflict: 'user_id' });

        if (error) throw error;
        toast.success('Business profile saved successfully');
        
        // Refresh page or trigger callback if needed to update parent state
    } catch (error: any) {
        console.error('Error updating profile:', error);
        toast.error('Failed to save profile: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading && !profile.id) {
     return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your company profile and contact information
        </p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
            <CardTitle className="text-gray-900">General Information</CardTitle>
            <CardDescription>
                {businessId ? 'Update your business details below' : 'Create your business profile to get started'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="company_name"
                            value={profile.company_name}
                            onChange={e => handleChange('company_name', e.target.value)}
                            className="pl-9 h-11 bg-white border-gray-200 text-gray-900"
                            required
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            placeholder="e.g. Fintech, E-commerce"
                            value={profile.industry || ''}
                            onChange={e => handleChange('industry', e.target.value)}
                            className="h-11 bg-white border-gray-200 text-gray-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Public Contact Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                value={profile.company_email || ''}
                                onChange={e => handleChange('company_email', e.target.value)}
                                className="pl-9 h-11 bg-white border-gray-200 text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://..."
                                value={profile.website || ''}
                                onChange={e => handleChange('website', e.target.value)}
                                className="pl-9 h-11 bg-white border-gray-200 text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea 
                        id="description"
                        placeholder="Tell us about your business..."
                        value={profile.description || ''}
                        onChange={e => handleChange('description', e.target.value)}
                        className="min-h-[100px] bg-white border-gray-200 text-gray-900"
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <Save className="w-4 h-4 mr-2" />
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
            <CardTitle className="text-gray-900">Subscription & Billing</CardTitle>
            <CardDescription>Manage your API plan and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { id: 'free', name: 'Free', price: '$0/mo', limits: '1,000 requests/mo' },
                    { id: 'pro', name: 'Pro', price: '$49/mo', limits: '100,000 requests/mo' },
                    { id: 'enterprise', name: 'Enterprise', price: 'Custom', limits: 'Unlimited requests' }
                ].map((tier) => (
                    <div 
                        key={tier.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            profile.api_tier === tier.id
                            ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' 
                            : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            handleChange('api_tier', tier.id);
                            toast.success(`Selected ${tier.name} Plan. Click Save to confirm.`);
                        }}
                    >
                        {profile.api_tier === tier.id && (
                            <div className="absolute -top-3 -right-3 bg-purple-600 text-white p-1 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900">{tier.name}</h3>
                        </div>
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-gray-900">{tier.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium bg-white/50 p-2 rounded-lg inline-block">
                            {tier.limits}
                        </p>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900">Payment Method</h4>
                        <p className="text-sm text-gray-500 mt-1">Managed securely via Stripe</p>
                    </div>
                    <Button variant="outline">Add Payment Method</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
