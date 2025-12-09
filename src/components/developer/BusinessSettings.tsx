import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
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
    industry: ''
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
            industry: initialProfile.industry || ''
        });
    } else if (businessId) {
        fetchProfile();
    }
  }, [businessId, initialProfile]);

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
        setProfile({
            id: data.id,
            company_name: data.company_name || '',
            company_email: data.company_email || '',
            website: data.website || '',
            description: data.description || '',
            industry: data.industry || ''
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
        // Try getting user from server first (more secure)
        let { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // Fallback to local session if server check fails (e.g. network issue)
        if (authError || !user) {
            console.warn('getUser failed, trying getSession', authError);
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user ?? null;
        }

        if (!user) {
            toast.error('Session expired. Please refresh the page or log in again.');
            return;
        }

        const updates = {
            user_id: user.id,
            company_name: profile.company_name,
            company_email: profile.company_email,
            website: profile.website,
            description: profile.description,
            industry: profile.industry,
            updated_at: new Date().toISOString()
        };

        // Use upsert to handle both create and update scenarios
        const { error } = await supabase
            .from('business_profiles')
            .upsert(updates, { onConflict: 'user_id' });

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
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="company_name"
                                value={profile.company_name}
                                onChange={e => handleChange('company_name', e.target.value)}
                                className="pl-9 bg-white border-gray-200 text-gray-900"
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
                            className="bg-white border-gray-200 text-gray-900"
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
                                className="pl-9 bg-white border-gray-200 text-gray-900"
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
                                className="pl-9 bg-white border-gray-200 text-gray-900"
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
