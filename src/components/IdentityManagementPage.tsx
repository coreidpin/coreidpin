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
import { colors, typography, spacing, borderRadius } from '../styles/designTokens';
import { shadows, premiumCardShadow } from '../styles/shadows';
import { activityTracker } from '../utils/activityTracker';

// Constants
const PROFESSIONAL_ROLES = [
  "Software Engineer", "Senior Software Engineer", "Lead Software Engineer",
  "Product Manager", "Senior Product Manager", "Lead Product Manager", "Chief Product Manager", "Head of Product", "Growth Product Manager",
  "Designer", "Senior Product Designer", "Lead Product Designer",
  "Data Scientist", "Marketing Specialist", "Sales Representative", "HR Manager", "Financial Analyst",
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

  // Load profile data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const session = getSessionState();
        if (!session?.userId) {
          navigate('/login');
          return;
        }

        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.userId)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            name: profileData.full_name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            role: profileData.job_title || '',
            bio: profileData.bio || '',
            years_of_experience: profileData.years_of_experience || '',
            industry: profileData.industry || '',
            work_preference: profileData.work_preference || '',
            nationality: profileData.nationality || '',
            city: profileData.city || '',
            date_of_birth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
            recovery_email: profileData.recovery_email || '',
            linkedin: profileData.linkedin_url || '',
            website: profileData.website || '',
            work_experience: profileData.work_experience || [],
            skills: profileData.skills || [],
            tools: profileData.tools || [],
            industry_tags: profileData.industry_tags || [],
            certifications: profileData.certifications || []
          });

          // Calculate profile completeness
          const fields = [profileData.full_name, profileData.email, profileData.phone, profileData.bio, profileData.city];
          setProfileCompleteness(Math.round((fields.filter(f => f).length / fields.length) * 100));
        }

        // Fetch PIN data
        const token = await ensureValidSession();
        if (token) {
          const pinRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/pin/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (pinRes.ok) {
            const pinResult = await pinRes.json();
            if (pinResult.success && pinResult.pin) {
              setPinData({ pin_number: pinResult.pin });
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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

      if (!profile?.user_id) {
        toast.error('User profile not loaded');
        return;
      }

      // Ensure session is valid and synced with Supabase client
      const token = await ensureValidSession();
      if (token) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: token
        });
      } else {
        toast.error('Session expired. Please login again.');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      const toastId = toast.loading('Uploading image...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${profile.user_id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        toast.dismiss(toastId);
        throw new Error(uploadError.message);
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
        console.error('Profile update error:', updateError);
        toast.dismiss(toastId);
        throw new Error(updateError.message);
      }

      setProfile({ ...profile, profile_picture_url: publicUrl });
      toast.dismiss(toastId);
      toast.success('Profile picture updated');

      // Track activity
      await activityTracker.profilePictureUploaded();

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
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

      // Track activity - determine what changed
      const changedFields: string[] = [];
      if (formData.name !== profile.name) changedFields.push('Name');
      if (formData.role !== profile.role) changedFields.push('Role');
      if (formData.bio !== profile.bio) changedFields.push('Bio');
      if (formData.industry !== profile.industry) changedFields.push('Industry');
      if (changedFields.length > 0) {
        await activityTracker.profileUpdated(changedFields);
      }

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

  const PremiumBackground = () => (
    <>
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 py-4 sm:py-8 selection:bg-blue-500/30">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-3 sm:mb-4 text-white/70 hover:text-white hover:bg-white/10 pl-0 group text-sm sm:text-base"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                Manage Identity
              </h1>
              <span className="text-white/40 hidden sm:inline">•</span>
              <p className="text-white text-sm sm:text-base md:text-lg w-full sm:w-auto">Your professional identity hub</p>
            </div>
          </div>
        </motion.div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 sm:space-y-12 mt-4 sm:mt-8">
          <TabsList className="flex flex-wrap w-full bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
            <TabsTrigger 
              value="overview" 
              className="flex-1 min-w-[100px] py-3 px-2 rounded-lg text-slate-600 text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="flex-1 min-w-[120px] py-3 px-2 rounded-lg text-slate-600 text-sm sm:text-base text-center data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              <span className="hidden sm:inline">Personal & Professional</span>
              <span className="sm:hidden">Personal & Prof.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="work" 
              className="flex-1 min-w-[100px] py-3 px-2 rounded-lg text-slate-600 text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              Work Identity
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
            {/* Identity Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <PremiumBackground />
              
              <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Identity Overview</h3>
                    <p className="text-gray-400 text-sm">Your professional identity at a glance</p>
                  </div>
                </div>

                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="flex-shrink-0 relative group/avatar">
                    <div 
                      className="w-32 h-32 rounded-full bg-black border-4 border-white/10 shadow-xl flex items-center justify-center cursor-pointer relative overflow-hidden ring-2 ring-white/5 group-hover/avatar:ring-blue-500/50 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <User className="h-12 w-12 text-gray-600 mx-auto mb-2" />
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
                      <p className="text-gray-400 text-lg">{formData.role || 'No Role Set'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto sm:mx-0">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Phone className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-300">{formData.phone || 'Not Set'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-300 truncate">{formData.email || 'Not Set'}</span>
                      </div>
                    </div>

                    {/* PIN Display */}
                    {pinData && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 rounded-lg border border-white/10 shadow-inner mt-2 backdrop-blur-sm">
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
                    <span className="text-sm font-medium text-gray-400">Profile Completeness</span>
                    <span className="text-sm font-bold text-blue-400">{profileCompleteness}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Verification Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile?.email_verified ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        <div className="p-1 rounded-full bg-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-emerald-400">Email</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
                        <div className="p-1 rounded-full bg-white/10">
                          <CheckCircle2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Email</span>
                      </div>
                    )}
                    
                    {/* Placeholder badges for other verifications */}
                    {['Phone', 'Work', 'Identity'].map((item) => (
                      <div key={item} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
                         <div className="p-1 rounded-full bg-white/10">
                          <CheckCircle2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <PremiumBackground />
              
              <div className="relative z-10 p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Full Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-400">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all [color-scheme:dark]" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <SelectItem value="male" className="focus:bg-white/10 focus:text-white cursor-pointer">Male</SelectItem>
                        <SelectItem value="female" className="focus:bg-white/10 focus:text-white cursor-pointer">Female</SelectItem>
                        <SelectItem value="non-binary" className="focus:bg-white/10 focus:text-white cursor-pointer">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say" className="focus:bg-white/10 focus:text-white cursor-pointer">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Nationality</Label>
                    <Input 
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all" 
                      placeholder="e.g. Nigerian"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">City</Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all" 
                      placeholder="e.g. Lagos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Phone Number</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Identity (Critical Section) */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Contact Identity
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Manage your primary identity and contact channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Identity: Phone */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 font-medium">Phone</Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input 
                        value={formData.phone}
                        readOnly
                        className="bg-slate-50 border-slate-200 text-slate-900 pl-10 font-mono" 
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute right-1 top-1 bottom-1 h-auto px-2 text-xs text-slate-500 hover:text-slate-900"
                      >
                        Change
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Your unique identifier on GidiPIN.
                    </p>
                  </div>

                  {/* Primary Email */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 font-medium">Email</Label>
                      {profile?.email_verified ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 pl-10" 
                      />
                    </div>
                  </div>

                  {/* Recovery Email */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Recovery Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input 
                        value={formData.recovery_email || ''}
                        onChange={(e) => setFormData({ ...formData, recovery_email: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 pl-10 placeholder:text-slate-400"
                        placeholder="backup@example.com"
                      />
                      <Button 
                        size="icon"
                        variant="ghost" 
                        className="absolute right-1 top-1 bottom-1 h-auto w-8 text-slate-400 hover:text-blue-600"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium block">Social Presence</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </div>
                      <Input 
                        value={formData.linkedin || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 pl-10 placeholder:text-slate-400"
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                      </div>
                      <Input 
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 pl-10 placeholder:text-slate-400"
                        placeholder="Personal Website URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </div>
                      <Input 
                        value={formData.twitter || ''}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 pl-10 placeholder:text-slate-400"
                        placeholder="Twitter Profile URL"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-700">Professional Title</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => {
                      setFormData({ ...formData, role: value });
                      setIsCustomRole(value === 'Custom');
                      if (value !== 'Custom') setCustomRoleText('');
                    }}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {PROFESSIONAL_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="text-slate-900">{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCustomRole && (
                    <Input 
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 mt-2" 
                      placeholder="Enter your custom role"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-slate-700">Professional Bio</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 min-h-[100px]" 
                    placeholder="Tell us about your professional background..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-700">Years of Experience</Label>
                    <Input 
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50" 
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind.toLowerCase()} className="text-slate-900">{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-700">Work Preference</Label>
                    <Select value={formData.work_preference} onValueChange={(value) => setFormData({ ...formData, work_preference: value })}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {WORK_PREFERENCES.map((pref) => (
                          <SelectItem key={pref} value={pref} className="text-slate-900 capitalize">{pref}</SelectItem>
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
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
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
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Work Experience
                </CardTitle>
                <Button 
                  onClick={() => setShowWorkModal(true)}
                  size="sm" 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                >
                  Add Position
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.work_experience.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500 text-sm">No work experience added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.work_experience.map((work, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 group relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-slate-900 font-semibold">{work.role}</h4>
                            <p className="text-blue-600 text-sm">{work.company}</p>
                            <p className="text-slate-500 text-xs mt-1">
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
                              className="h-8 w-8 text-slate-400 hover:text-slate-900"
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
                          <p className="text-slate-600 text-sm mt-3 border-t border-slate-200 pt-3">
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
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('skills', skillInput, setSkillInput)}
                        placeholder="Add a skill (e.g. React)"
                        className="bg-white border-slate-200 text-slate-900"
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
                        <Badge key={skill} className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 pr-1">
                          {skill}
                          <button onClick={() => handleRemoveTag('skills', skill)} className="ml-2 hover:text-blue-800">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-lg">Tools & Software</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('tools', toolInput, setToolInput)}
                        placeholder="Add a tool (e.g. Figma)"
                        className="bg-white border-slate-200 text-slate-900"
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
                        <Badge key={tool} className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 pr-1">
                          {tool}
                          <button onClick={() => handleRemoveTag('tools', tool)} className="ml-2 hover:text-purple-800">
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
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Industry Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      placeholder="Add industry (e.g. Fintech)"
                      className="bg-white border-slate-200 text-slate-900"
                    />
                    <Button 
                      onClick={() => handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      variant="outline"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.industry_tags.map((tag) => (
                      <Badge key={tag} className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 pr-1">
                        {tag}
                        <button onClick={() => handleRemoveTag('industry_tags', tag)} className="ml-2 hover:text-indigo-800">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
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
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500 text-sm">No certifications added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex justify-between items-start group">
                        <div>
                          <h4 className="text-slate-900 font-semibold">{cert.name}</h4>
                          <p className="text-slate-600 text-sm">{cert.issuer}</p>
                          <p className="text-slate-500 text-xs mt-1">{cert.date}</p>
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
          <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-[500px]">
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
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label>Role/Title</Label>
                  <Input 
                    value={tempWork.role}
                    onChange={(e) => setTempWork({ ...tempWork, role: e.target.value })}
                    className="bg-white border-slate-200 text-slate-900"
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
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="month"
                    value={tempWork.end_date}
                    onChange={(e) => setTempWork({ ...tempWork, end_date: e.target.value })}
                    disabled={tempWork.current}
                    className="bg-white border-slate-200 text-slate-900 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="current-role"
                  checked={tempWork.current}
                  onChange={(e) => setTempWork({ ...tempWork, current: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600"
                />
                <Label htmlFor="current-role" className="text-slate-900">I currently work here</Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={tempWork.description}
                  onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900 min-h-[100px]"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWorkModal(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
              <Button onClick={handleSaveWork} className="bg-slate-900 text-white hover:bg-slate-800">Save Position</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certification Modal */}
        <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Certification Name</Label>
                <Input 
                  value={tempCert.name}
                  onChange={(e) => setTempCert({ ...tempCert, name: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <Label>Issuing Organization</Label>
                <Input 
                  value={tempCert.issuer}
                  onChange={(e) => setTempCert({ ...tempCert, issuer: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <Label>Date Issued</Label>
                <Input 
                  type="month"
                  value={tempCert.date}
                  onChange={(e) => setTempCert({ ...tempCert, date: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <Label>Credential URL (Optional)</Label>
                <Input 
                  value={tempCert.url}
                  onChange={(e) => setTempCert({ ...tempCert, url: e.target.value })}
                  className="bg-white border-slate-200 text-slate-900"
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCertModal(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
              <Button onClick={handleSaveCert} className="bg-slate-900 text-white hover:bg-slate-800">Add Certification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
