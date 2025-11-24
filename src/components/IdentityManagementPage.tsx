import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, User, Phone, Mail, Briefcase, CheckCircle2, 
  ArrowLeft, Save, Loader2, X, Camera, Upload 
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { getSessionState, ensureValidSession } from '../utils/session';
import { handleApiError } from '../utils/apiErrorHandler';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

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
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
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
    gender: '',
    recovery_email: '',
    linkedin: '',
    website: '',
    work_experience: [] as any[],
    skills: [] as string[],
    tools: [] as string[],
    industry_tags: [] as string[],
    certifications: [] as any[]
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');

  // Work Identity State
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [tempWork, setTempWork] = useState({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    current: false,
    description: ''
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [tempCert, setTempCert] = useState({
    name: '',
    issuer: '',
    date: '',
    url: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  // Helper functions for Work Identity
  const handleAddTag = (field: 'skills' | 'tools' | 'industry_tags', value: string, setInput: (val: string) => void) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) {
      setInput('');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setInput('');
  };

  const handleRemoveTag = (field: 'skills' | 'tools' | 'industry_tags', tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveWork = () => {
    if (!tempWork.company || !tempWork.role) {
      toast.error('Company and Role are required');
      return;
    }
    
    setFormData(prev => {
      const newWork = [...prev.work_experience];
      if (editingWorkIndex !== null) {
        newWork[editingWorkIndex] = tempWork;
      } else {
        newWork.push(tempWork);
      }
      return { ...prev, work_experience: newWork };
    });
    
    setShowWorkModal(false);
    setEditingWorkIndex(null);
    setTempWork({ company: '', role: '', start_date: '', end_date: '', current: false, description: '' });
  };

  const handleRemoveWork = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCert = () => {
    if (!tempCert.name || !tempCert.issuer) {
      toast.error('Name and Issuer are required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, tempCert]
    }));

    setShowCertModal(false);
    setTempCert({ name: '', issuer: '', date: '', url: '' });
  };

  const handleRemoveCert = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOCX, or TXT.');
      return;
    }

    setIsUploadingCV(true);

    try {
      // Use Gemini API directly from the frontend
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Data = btoa(String.fromCharCode(...uint8Array));

      // Determine MIME type
      let mimeType = file.type;
      if (!mimeType || mimeType === '') {
        if (file.name.endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (file.name.endsWith('.txt')) {
          mimeType = 'text/plain';
        }
      }

      const prompt = `You are an expert CV parser. Extract the following information from this resume and return it in STRICT JSON format only, with no additional text or markdown formatting.

Required JSON Structure (MUST be valid JSON):
{
  "work_experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or empty string if current",
      "current": false,
      "description": "Brief summary"
    }
  ],
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM"
    }
  ]
}

Return ONLY the JSON object, no markdown, no explanations.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        const rawText = await response.text();
        console.error('Gemini API Error:', rawText);
        throw new Error(`Gemini API error (${response.status}): ${rawText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('Gemini Response:', data);

      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown code blocks if present
      let jsonStr = textResponse.trim();
      jsonStr = jsonStr.replace(/^```json\s*/gm, '');
      jsonStr = jsonStr.replace(/^```\s*/gm, '');
      jsonStr = jsonStr.replace(/```$/gm, '');
      jsonStr = jsonStr.trim();

      const extractedData = JSON.parse(jsonStr);

      setFormData(prev => ({
        ...prev,
        work_experience: [...prev.work_experience, ...(extractedData.work_experience || [])],
        skills: [...new Set([...prev.skills, ...(extractedData.skills || [])])],
        tools: [...new Set([...prev.tools, ...(extractedData.tools || [])])],
        certifications: [...prev.certifications, ...(extractedData.certifications || [])]
      }));
      
      toast.success('CV parsed successfully!', {
        description: 'We extracted your work experience, skills, and certifications.'
      });
    } catch (error: any) {
      console.error('CV Upload Error:', error);
      toast.error('Failed to process CV', {
        description: error.message
      });
    } finally {
      setIsUploadingCV(false);
      if (cvInputRef.current) {
        cvInputRef.current.value = '';
      }
    }
  };

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
        gender: profileData.gender || '',
        recovery_email: profileData.recovery_email || '',
        linkedin: profileData.linkedin || '',
        website: profileData.website || '',
        work_experience: profileData.work_experience || [],
        skills: profileData.skills || [],
        tools: profileData.tools || [],
        industry_tags: profileData.industry_tags || [],
        certifications: profileData.certifications || []
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

  const handleSaveWorkIdentity = async () => {
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

      const updates = {
        work_experience: formData.work_experience,
        skills: formData.skills,
        tools: formData.tools,
        industry_tags: formData.industry_tags,
        certifications: formData.certifications
      };

      // Construct the full URL to avoid proxy issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/work-identity-update`;

      console.log('Sending request to:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText);

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.details) {
            console.error('Error details:', errorData.details);
          }
        } catch (e) {
          // If not JSON, use the text
          if (responseText) errorMessage = responseText.substring(0, 200);
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);

      // Update local state
      setProfile({ ...profile, ...result.profile });
      calculateCompleteness(result.profile);
      
      setMessage({ type: 'success', text: 'Work Identity updated successfully' });
      toast.success('Work Identity updated');

    } catch (error) {
      console.error('Error saving work identity:', error);
      
      if (error instanceof Error && !error.message.includes('Authentication failed')) {
        setMessage({ type: 'error', text: 'Failed to update work identity' });
        toast.error(`Failed to save changes: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
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
      };


      // Construct the full URL to avoid proxy issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/profile-update`;

      console.log('Sending profile update to:', functionUrl);

      // Call the secure Edge Function instead of direct Supabase
      const response = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      // Read response body once to avoid stream consumption error
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('API error (non-JSON):', responseText);
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
        }
        
        console.error('API error:', errorData);
        
        // Handle auth errors automatically
        await handleApiError(errorData, response);
        
        throw new Error(errorData.error || 'Failed to update profile');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response JSON:', responseText);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}...`);
      }

      // Update local state
      setProfile({ ...profile, ...result.profile });
      calculateCompleteness(result.profile);
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      toast.success('Profile updated');

    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Only show error toast if not already handled by handleApiError
      if (error instanceof Error && !error.message.includes('Authentication failed')) {
        setMessage({ type: 'error', text: 'Failed to update profile' });
        toast.error(`Failed to save changes: ${error.message || 'Unknown error'}`);
      }
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
    <div className="min-h-screen bg-slate-950 text-white py-8 selection:bg-blue-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-slate-400 hover:text-white pl-0 hover:bg-transparent group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            Manage Identity
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Your professional identity hub</p>
        </div>

        {/* Message Banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border backdrop-blur-md ${
              message.type === 'success'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{message.text}</span>
              <button onClick={() => setMessage(null)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-1 rounded-xl h-auto">
            <TabsTrigger 
              value="overview" 
              className="py-3 rounded-lg text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="py-3 rounded-lg text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              Personal & Professional
            </TabsTrigger>
            <TabsTrigger 
              value="work" 
              className="py-3 rounded-lg text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              Work Identity
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
            {/* Identity Overview Card */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  Identity Overview
                </CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Your professional identity at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="flex-shrink-0 relative group/avatar">
                    <div 
                      className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center cursor-pointer relative overflow-hidden ring-2 ring-white/10 group-hover/avatar:ring-blue-500/50 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <User className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="mt-3 text-center">
                      <span className="text-xs font-medium text-blue-400 opacity-0 group-hover/avatar:opacity-100 transition-opacity">Click to upload</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 text-center sm:text-left w-full">
                    <div>
                      <h3 className="text-3xl font-bold text-white tracking-tight">{formData.name || 'Not Set'}</h3>
                      <p className="text-slate-400 text-lg">{formData.role || 'No Role Set'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto sm:mx-0">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <Phone className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-300">{formData.phone || 'Not Set'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-300 truncate">{formData.email || 'Not Set'}</span>
                      </div>
                    </div>

                    {/* PIN Display */}
                    {pinData && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/10 shadow-inner mt-2">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-bold tracking-widest text-lg">{pinData.pin_number}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] ml-2">
                          ACTIVE PIN
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Profile Completeness */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Profile Completeness</span>
                    <span className="text-sm font-bold text-blue-400">{profileCompleteness}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompleteness}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  </div>
                </div>

                {/* Verification Badges */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile?.email_verified ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="p-1 rounded-full bg-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-emerald-400">Email</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-white/5 opacity-60">
                        <div className="p-1 rounded-full bg-white/10">
                          <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">Email</span>
                      </div>
                    )}
                    
                    {/* Placeholder badges for other verifications */}
                    {['Phone', 'Work', 'Identity'].map((item) => (
                      <div key={item} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-white/5 opacity-60">
                         <div className="p-1 rounded-full bg-white/10">
                          <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">{item}</span>
                      </div>
                    ))}
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

            {/* Contact Identity (Critical Section) */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50 border-l-4 border-l-[#32f08c]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#32f08c]" />
                  Contact Identity
                </CardTitle>
                <CardDescription className="text-white/90">
                  Manage your primary identity and contact channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Identity: Phone */}
                <div className="bg-[#32f08c]/5 rounded-lg p-4 border border-[#32f08c]/20">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#32f08c] font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Primary Identity (Phone)
                    </Label>
                    <Badge className="bg-[#32f08c] text-black hover:bg-[#32f08c]/90">Verified</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input 
                      value={formData.phone}
                      readOnly
                      className="bg-black/20 border-white/10 text-white font-mono text-lg tracking-wide" 
                    />
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                      Change
                    </Button>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    Your phone number is your primary unique identifier on CoreID.
                  </p>
                </div>

                {/* Email Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-1.5 block">Primary Email</Label>
                    <div className="relative">
                      <Input 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pr-24" 
                      />
                      <div className="absolute right-1 top-1 bottom-1 flex items-center">
                        {profile?.email_verified ? (
                          <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 mr-1">
                            Verified
                          </Badge>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-[#32f08c] hover:text-[#32f08c] hover:bg-[#32f08c]/10">
                            Verify Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-1.5 block">Recovery Email</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={formData.recovery_email || ''}
                        onChange={(e) => setFormData({ ...formData, recovery_email: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        placeholder="backup@example.com"
                      />
                      <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10 shrink-0">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Social Links */}
                <div>
                  <Label className="text-white mb-3 block">Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-white/40">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </div>
                      <Input 
                        value={formData.linkedin || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pl-10 placeholder:text-white/30"
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-white/40">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                      </div>
                      <Input 
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pl-10 placeholder:text-white/30"
                        placeholder="Personal Website URL"
                      />
                    </div>
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
                className="bg-white hover:bg-gray-100 text-black font-semibold border-2 border-black"
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

          {/* WORK IDENTITY TAB */}
          <TabsContent value="work" className="space-y-6">
            {/* CV Import Header */}
            <div className="flex justify-end">
              <input
                type="file"
                ref={cvInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleCVUpload}
              />
              <Button
                onClick={() => cvInputRef.current?.click()}
                disabled={isUploadingCV}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                {isUploadingCV ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing CV...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import from CV
                  </>
                )}
              </Button>
            </div>

            {/* Work Experience */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#32f08c]" />
                  Work Experience
                </CardTitle>
                <Button 
                  onClick={() => setShowWorkModal(true)}
                  size="sm" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                  Add Position
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.work_experience.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-white/50 text-sm">No work experience added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.work_experience.map((work, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 group relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-semibold">{work.role}</h4>
                            <p className="text-[#32f08c] text-sm">{work.company}</p>
                            <p className="text-white/50 text-xs mt-1">
                              {work.start_date} - {work.current ? 'Present' : work.end_date}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              onClick={() => {
                                setTempWork(work);
                                setEditingWorkIndex(index);
                                setShowWorkModal(true);
                              }}
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white/70 hover:text-white"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Button>
                            <Button 
                              onClick={() => handleRemoveWork(index)}
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {work.description && (
                          <p className="text-white/70 text-sm mt-3 border-t border-white/5 pt-3">
                            {work.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('skills', skillInput, setSkillInput)}
                        placeholder="Add a skill (e.g. React)"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button 
                        onClick={() => handleAddTag('skills', skillInput, setSkillInput)}
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} className="bg-[#32f08c]/10 text-[#32f08c] border-[#32f08c]/20 hover:bg-[#32f08c]/20 pr-1">
                          {skill}
                          <button onClick={() => handleRemoveTag('skills', skill)} className="ml-2 hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Tools & Software</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('tools', toolInput, setToolInput)}
                        placeholder="Add a tool (e.g. Figma)"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button 
                        onClick={() => handleAddTag('tools', toolInput, setToolInput)}
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tools.map((tool) => (
                        <Badge key={tool} className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 pr-1">
                          {tool}
                          <button onClick={() => handleRemoveTag('tools', tool)} className="ml-2 hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Industry Tags */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Industry Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      placeholder="Add industry (e.g. Fintech)"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button 
                      onClick={() => handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      variant="outline"
                      className="border-white/20 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.industry_tags.map((tag) => (
                      <Badge key={tag} className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 pr-1">
                        {tag}
                        <button onClick={() => handleRemoveTag('industry_tags', tag)} className="ml-2 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-[#0e0f12]/80 backdrop-blur-sm border-[#1a1b1f]/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#32f08c]" />
                  Certifications
                </CardTitle>
                <Button 
                  onClick={() => setShowCertModal(true)}
                  size="sm" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                  Add Certification
                </Button>
              </CardHeader>
              <CardContent>
                {formData.certifications.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-white/50 text-sm">No certifications added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-start group">
                        <div>
                          <h4 className="text-white font-semibold">{cert.name}</h4>
                          <p className="text-white/70 text-sm">{cert.issuer}</p>
                          <p className="text-white/50 text-xs mt-1">{cert.date}</p>
                        </div>
                        <Button 
                          onClick={() => handleRemoveCert(index)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button for Work Tab */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveWorkIdentity}
                disabled={saving}
                className="bg-white hover:bg-gray-100 text-black font-semibold border-2 border-black"
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

        {/* Work Experience Modal */}
        <Dialog open={showWorkModal} onOpenChange={setShowWorkModal}>
          <DialogContent className="bg-[#0e0f12] border-white/10 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingWorkIndex !== null ? 'Edit Position' : 'Add Position'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input 
                    value={tempWork.company}
                    onChange={(e) => setTempWork({ ...tempWork, company: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label>Role/Title</Label>
                  <Input 
                    value={tempWork.role}
                    onChange={(e) => setTempWork({ ...tempWork, role: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="month"
                    value={tempWork.start_date}
                    onChange={(e) => setTempWork({ ...tempWork, start_date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="month"
                    value={tempWork.end_date}
                    onChange={(e) => setTempWork({ ...tempWork, end_date: e.target.value })}
                    disabled={tempWork.current}
                    className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="current-role"
                  checked={tempWork.current}
                  onChange={(e) => setTempWork({ ...tempWork, current: e.target.checked })}
                  className="rounded border-white/10 bg-white/5 text-[#32f08c]"
                />
                <Label htmlFor="current-role">I currently work here</Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={tempWork.description}
                  onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWorkModal(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={handleSaveWork} className="bg-[#32f08c] text-black hover:bg-[#32f08c]/90">Save Position</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certification Modal */}
        <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
          <DialogContent className="bg-[#0e0f12] border-white/10 text-white sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Certification Name</Label>
                <Input 
                  value={tempCert.name}
                  onChange={(e) => setTempCert({ ...tempCert, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>Issuing Organization</Label>
                <Input 
                  value={tempCert.issuer}
                  onChange={(e) => setTempCert({ ...tempCert, issuer: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>Date Issued</Label>
                <Input 
                  type="month"
                  value={tempCert.date}
                  onChange={(e) => setTempCert({ ...tempCert, date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>Credential URL (Optional)</Label>
                <Input 
                  value={tempCert.url}
                  onChange={(e) => setTempCert({ ...tempCert, url: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCertModal(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={handleSaveCert} className="bg-[#32f08c] text-black hover:bg-[#32f08c]/90">Add Certification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
