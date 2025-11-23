import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, User, Phone, Mail, Briefcase, CheckCircle2, 
  ArrowLeft, Save, Loader2, X, Camera 
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { getSessionState, ensureValidSession } from '../utils/session';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

// Constants
const PROFESSIONAL_ROLES = [
  "Software Engineer", "Product Manager", "Data Scientist", "Designer", 
  "Marketing Specialist", "Sales Representative", "HR Manager", "Financial Analyst",
  "Project Manager", "Consultant", "Custom"
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail", 
  "Manufacturing", "Media", "Real Estate", "Transportation", "Energy"
];

const WORK_PREFERENCES = [
  "Remote", "Hybrid", "On-site", "Flexible"
];

export const IdentityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [pinData, setPinData] = useState<any>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bio: '',
    years_of_experience: '',
    industry: '',
    work_preference: '',
    nationality: '',
    city: '',
    date_of_birth: '',
    gender: ''
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ensure Valid Session
      const token = await ensureValidSession();
      if (!token) {
        console.log('Session expired or invalid');
        navigate('/login');
        return;
      }

      // 2. Get User ID from Session State
      const session = getSessionState();
      if (!session?.userId) {
        console.error('No user ID found in session');
        navigate('/login');
        return;
      }

      // 3. Get Profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.userId)
        .single();

      // Handle missing profile gracefully
      if (profileError && profileError.code === 'PGRST116') {
        console.warn('Profile not found, initializing empty profile');
        profileData = {
          user_id: session.userId,
          name: '',
          email: '', // Ideally fetch from auth user if possible, but empty is safe
          phone: '',
          role: '',
          profile_complete: false
        };
        profileError = null;
      }

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        role: profileData.role || '',
        bio: profileData.bio || '',
        years_of_experience: profileData.years_of_experience || '',
        industry: profileData.industry || '',
        work_preference: profileData.work_preference || '',
        nationality: profileData.nationality || '',
        city: profileData.city || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || ''
      });

      // Handle custom role
      if (profileData.role && !PROFESSIONAL_ROLES.includes(profileData.role)) {
        setIsCustomRole(true);
        setCustomRoleText(profileData.role);
        setFormData(prev => ({ ...prev, role: 'Custom' }));
      }

      // 4. Get PIN
      try {
        const { data: pin } = await supabase
          .from('identity_users')
          .select('pin_number')
          .eq('user_id', session.userId)
          .single();
        setPinData(pin);
      } catch (e) {
        console.log('No PIN found or error fetching PIN');
      }

      // 5. Calculate Completeness
      calculateCompleteness(profileData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = (data: any) => {
    if (!data) return;
    const fields = ['name', 'email', 'phone', 'role', 'bio', 'industry', 'city', 'nationality'];
    const filled = fields.filter(field => data[field] && data[field].length > 0).length;
    setProfileCompleteness(Math.round((filled / fields.length) * 100));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      const toastId = toast.loading('Uploading image...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast.dismiss(toastId);
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', profile.user_id);

      if (updateError) {
        toast.dismiss(toastId);
        throw updateError;
      }

      setProfile({ ...profile, profile_picture_url: publicUrl });
      toast.dismiss(toastId);
      toast.success('Profile picture updated');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // 1. Ensure Valid Session
      const token = await ensureValidSession();
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      // 2. Get User ID
      const session = getSessionState();
      if (!session?.userId) {
        toast.error('Session invalid. Please login again.');
        navigate('/login');
        return;
      }

      // Validation
      if (!formData.name.trim()) {
        toast.error('Full Name is required');
        setSaving(false);
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email is required');
        setSaving(false);
        return;
      }

      const roleToSave = isCustomRole ? customRoleText : formData.role;

      const updates = {
        ...formData,
        role: roleToSave,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .eq('user_id', session.userId);

      if (error) throw error;

      // Update local state
      setProfile({ ...profile, ...updates });
      calculateCompleteness({ ...profile, ...updates });
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      toast.success('Profile updated');

    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#32f08c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-white/60 hover:text-white pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">Manage Identity</h1>
          <p className="text-white/90 mt-2">Your professional identity hub</p>
        </div>

        {/* Message Banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-[#32f08c]/10 border-[#32f08c]/30 text-[#32f08c]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="text-white data-[state=active]:bg-white/10">
              Personal & Professional
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Identity Overview Card */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#32f08c]" />
                  Identity Overview
                </CardTitle>
                <CardDescription className="text-white/90">
                  Your professional identity at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture & Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center group hover:border-[#32f08c]/50 transition-colors cursor-pointer relative overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <User className="h-10 w-10 text-white mx-auto mb-1" />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="mt-2 text-center">
                      <span className="text-xs text-white/80">Click to upload</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{formData.name || 'Not Set'}</h3>
                      <p className="text-white/90">{formData.role || 'No Role Set'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#bfa5ff]" />
                        <span className="text-sm text-white">{formData.phone || 'Not Set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm text-white">{formData.email || 'Not Set'}</span>
                      </div>
                    </div>

                    {/* PIN Display */}
                    {pinData && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#32f08c]/10 rounded-lg border border-[#32f08c]/30">
                        <Phone className="h-4 w-4 text-[#32f08c]" />
                        <span className="font-mono text-[#32f08c]">{pinData.pin_number}</span>
                        <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30 text-xs">
                          Your PIN
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Profile Completeness */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Profile Completeness</span>
                    <span className="text-sm font-bold text-[#32f08c]">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                </div>

                {/* Verification Badges */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Verification Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {profile?.email_verified ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                        <CheckCircle2 className="h-4 w-4 text-green-400" style={{ color: '#4ade80' }} />
                        <span className="text-xs text-green-400" style={{ color: '#4ade80' }}>Email</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                        <CheckCircle2 className="h-4 w-4 text-gray-400" style={{ color: '#9ca3af' }} />
                        <span className="text-xs text-gray-400" style={{ color: '#9ca3af' }}>Email</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span className="text-xs text-white">Phone</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span className="text-xs text-white">Work</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span className="text-xs text-white">Identity</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-[#bfa5ff]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Full Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                    />
                  </div>

                  <div>
                    <Label className="text-white">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-white/50">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e0f12] border-white/10">
                        <SelectItem value="male" className="text-white">Male</SelectItem>
                        <SelectItem value="female" className="text-white">Female</SelectItem>
                        <SelectItem value="non-binary" className="text-white">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say" className="text-white">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Nationality</Label>
                    <Input 
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                      placeholder="e.g. Nigerian"
                    />
                  </div>

                  <div>
                    <Label className="text-white">City</Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                      placeholder="e.g. Lagos"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Phone Number</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#32f08c]" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Professional Title</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => {
                      setFormData({ ...formData, role: value });
                      setIsCustomRole(value === 'Custom');
                      if (value !== 'Custom') setCustomRoleText('');
                    }}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-white/50">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0e0f12] border-white/10">
                      {PROFESSIONAL_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="text-white">{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCustomRole && (
                    <Input 
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 mt-2" 
                      placeholder="Enter your custom role"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-white">Professional Bio</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 min-h-[100px]" 
                    placeholder="Tell us about your professional background..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Years of Experience</Label>
                    <Input 
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-white/50">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e0f12] border-white/10">
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind.toLowerCase()} className="text-white">{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Work Preference</Label>
                    <Select value={formData.work_preference} onValueChange={(value) => setFormData({ ...formData, work_preference: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e0f12] border-white/10">
                        {WORK_PREFERENCES.map((pref) => (
                          <SelectItem key={pref} value={pref} className="text-white capitalize">{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
