import React, { useState, useEffect, useRef } from 'react';
import { SocialLinksEditor, SocialLink } from './dashboard/SocialLinksEditor';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, Phone, Mail, Briefcase, CheckCircle2, 
  ArrowLeft, Save, Loader2, X, Camera, Upload, Edit2,
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube, Globe, GraduationCap,
  Zap, Building, Plus, Pencil, Trash2, FileText, Settings
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { getSessionState, ensureValidSession } from '../utils/session';
import { handleApiError } from '../utils/apiErrorHandler';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
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
import { TagInput } from './ui/TagInput';
import { DynamicListInput } from './ui/DynamicListInput';
import { colors, typography, spacing, borderRadius, gradients, shadows } from '../styles/designSystem';
import { ActivityTracker } from '../utils/activityTracker';
import type { ProofDocument } from './dashboard/ProofDocumentUpload';
import { EMPLOYMENT_TYPE_OPTIONS } from '../utils/employmentTypes';
import type { EmploymentType } from '../utils/employmentTypes';
import { CompanyLogoUpload } from './dashboard/CompanyLogoUpload';
import { ProofDocumentUpload } from './dashboard/ProofDocumentUpload';
import type { AvailabilityStatus, WorkPreference } from '../types/availability';
import { AVAILABILITY_LABELS, WORK_PREFERENCE_LABELS } from '../types/availability';
import { validators } from '../utils/validation';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import { ProfileCompletionWidget } from './dashboard/ProfileCompletionWidget';
import { HRISConnectModal } from './hris/HRISConnectModal';
import { syncFinchData } from '../utils/hris-api';
import { FullWidthCard } from './ui/FullWidthCard';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Updated to handle Real Finch Code (string) or Mock Object
  const handleHRISSuccess = async (result: any) => {
    if (!profile?.user_id) return;
    
    // Determine public token based on input type
    const publicToken = typeof result === 'string' ? result : result.publicToken;

    try {
      toast.loading('Syncing employment data via Finch (Real)...');
      
      // Call Real Edge Function
      const employeeData = await syncFinchData(publicToken);
      
      toast.dismiss();

      // Save to DB
      const { data: newExp, error } = await supabase
        .from('work_experiences')
        .insert({
          user_id: profile.user_id,
          company_name: employeeData.company_name,
          job_title: employeeData.job_title,
          start_date: employeeData.start_date,
          end_date: null,
          is_current: true,
          employment_type: employeeData.employment_type === 'Full-time' ? 'full_time' : 'contract',
          verification_status: 'verified',
          verification_source: 'hris_integration',
          verification_metadata: { provider: employeeData.provider }
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Update Local State
      setFormData(prev => ({
          ...prev,
          work_experience: [newExp, ...prev.work_experience]
      }));

      toast.success('Work history verified via ' + (employeeData.provider === 'workday' ? 'Workday' : 'Payroll Provider'));
      setShowConnectModal(false);
    } catch (err) {
      console.error('Error saving HRIS data', err);
      toast.dismiss();
      toast.error('Failed to sync/save verified data');
    }
  };

  // Helper: Convert empty date strings to null for database compatibility
  const sanitizeDateField = (dateValue: string | null | undefined): string | null => {
    if (!dateValue || dateValue.trim() === '') return null;
    return dateValue;
  };

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
    nationality: '',
    city: '',
    date_of_birth: '',
    gender: '',
    recovery_email: '',
    linkedin: '',
    website: '',
    twitter: '',
    availability_status: 'actively_working' as string,
    work_preference: 'remote' as string,
    work_experience: [] as any[],
    skills: [] as string[],
    tools: [] as string[],
    industry_tags: [] as string[],
    social_links: [] as SocialLink[],
    certifications: [] as any[],
    education: [] as any[]
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
    description: '',
    company_logo_url: '' as string | null | undefined,
    proof_documents: [] as ProofDocument[],
    employment_type: '' as EmploymentType | '',
    skills: [] as string[],
    achievements: [] as string[]
  });

  // Validation states for work experience form
  const [workErrors, setWorkErrors] = useState<Record<string, string>>({});

  const [showCertModal, setShowCertModal] = useState(false);
  const [tempCert, setTempCert] = useState({
    name: '',
    issuer: '',
    date: '',
    url: ''
  });

  const [showEducationModal, setShowEducationModal] = useState(false);
  const [tempEducation, setTempEducation] = useState({
    school: '',
    degree: '',
    field: '',
    start_year: '',
    end_year: '',
    description: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [actionLoading, setActionLoading] = useState(false);

  // Phone Verification State
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [devOTP, setDevOTP] = useState<string | null>(null);

  // Work Modal Tab State
  const [workModalTab, setWorkModalTab] = useState('basic');

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
        const { data: profileData } = await (supabase
          .from('profiles') as any)
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
            nationality: profileData.nationality || '',
            city: profileData.city || '',
            date_of_birth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
            recovery_email: profileData.recovery_email || '',
            linkedin: profileData.linkedin_url || '',
            website: profileData.website || '',
            twitter: '',
            availability_status: profileData.availability_status || 'actively_working',
            work_preference: profileData.work_preference || 'remote',
            work_experience: profileData.work_experience || [],
            skills: profileData.skills || [],
            tools: profileData.tools || [],
            industry_tags: profileData.industry_tags || [],
            social_links: profileData.social_links || [],
            certifications: profileData.certifications || [],
            education: profileData.education || []
          });

          // Calculate profile completeness using robust utility
          const { completion } = calculateProfileCompletion(profileData);
          setProfileCompleteness(completion);
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

  // Validate work experience form
  const validateWorkExperience = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required: Company (2-100 chars)
    const companyError = validators.required(tempWork.company, 'Company name');
    if (companyError) {
      errors.company = companyError;
    } else {
      const lengthError = validators.stringLength(tempWork.company, 2, 100, 'Company name');
      if (lengthError) errors.company = lengthError;
    }

    // Required: Role (2-100 chars)
    const roleError = validators.required(tempWork.role, 'Job title');
    if (roleError) {
      errors.role = roleError;
    } else {
      const lengthError = validators.stringLength(tempWork.role, 2, 100, 'Job title');
      if (lengthError) errors.role = lengthError;
    }

    // Required: Start date
    const startError = validators.required(tempWork.start_date, 'Start date');
    if (startError) {
      errors.start_date = startError;
    } else {
      // Valid date check
      const validError = validators.date.valid(tempWork.start_date, 'Start date');
      if (validError) {
        errors.start_date = validError;
      } else {
        // Not in future (allow current month)
        const futureError = validators.date.notFuture(tempWork.start_date + '-01', 'Start date');
        if (futureError) errors.start_date = futureError;
        
        // Work history range check
        const rangeError = validators.date.workHistoryRange(tempWork.start_date + '-01', 'Start date');
        if (rangeError) errors.start_date = rangeError;
      }
    }

    // End date logic
    if (tempWork.current && tempWork.end_date && tempWork.end_date.trim()) {
      errors.end_date = 'Current role cannot have an end date';
    } else if (!tempWork.current && tempWork.end_date) {
      // Validate end date format
      const validError = validators.date.valid(tempWork.end_date, 'End date');
      if (validError) {
        errors.end_date = validError;
      } else {
        // End date should be after start date
        const afterError = validators.date.isAfter(
          tempWork.start_date + '-01',
          tempWork.end_date + '-01',
          'Start date',
          'End date'
        );
        if (afterError) errors.end_date = afterError;
      }
    }

    // Optional: Description (max 1000 chars)
    if (tempWork.description) {
      const lengthError = validators.stringLength(tempWork.description, 0, 1000, 'Description');
      if (lengthError) errors.description = lengthError;
    }

    // Optional: Skills array (max 20 items, each 2-50 chars)
    if (tempWork.skills && tempWork.skills.length > 0) {
      const arrayError = validators.array.maxLength(tempWork.skills, 20, 'Skills');
      if (arrayError) {
        errors.skills = arrayError;
      } else {
        // Validate each skill length
        for (let idx = 0; idx < tempWork.skills.length; idx++) {
          const skill = tempWork.skills[idx];
          const skillError = validators.stringLength(skill, 2, 50, `Skill #${idx + 1}`);
          if (skillError) {
            errors.skills = `Skill "${skill}": must be 2-50 characters`;
            break; // Stop at first error
          }
        }
      }
    }

    // Optional: Achievements array (max 10 items, each 10-500 chars)
    if (tempWork.achievements && tempWork.achievements.length > 0) {
      const arrayError = validators.array.maxLength(tempWork.achievements, 10, 'Achievements');
      if (arrayError) {
        errors.achievements = arrayError;
      } else {
        // Validate each achievement length
        for (let idx = 0; idx < tempWork.achievements.length; idx++) {
          const achievement = tempWork.achievements[idx];
          const achError = validators.stringLength(achievement, 10, 500, `Achievement #${idx + 1}`);
          if (achError) {
            errors.achievements = `Achievement ${idx + 1}: must be 10-500 characters`;
            break; // Stop at first error
          }
        }
      }
    }

    // Optional: Company logo URL
    if (tempWork.company_logo_url) {
      const urlError = validators.url(tempWork.company_logo_url, 'Company logo URL');
      if (urlError) errors.company_logo_url = urlError;
    }

    return errors;
  };

  const handleSaveWork = async () => {
    // VALIDATE FIRST - comprehensive validation
    const errors = validateWorkExperience();
    
    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      setWorkErrors(errors);
      
      // Show first error in toast for user feedback
      const firstErrorField = Object.keys(errors)[0];
      const firstError = errors[firstErrorField];
      toast.error(firstError);
      return; // STOP - don't proceed with save
    }

    // Clear any previous errors
    setWorkErrors({});
    
    try {
        setSaving(true);
        const session = getSessionState();
        if (!session?.userId) return;

        // Format dates: input type="month" gives "YYYY-MM", Postgres needs "YYYY-MM-DD"
        const formatDate = (dateString: string) => {
             if (!dateString || dateString.trim() === '') return null;
             return dateString.length === 7 ? `${dateString}-01` : dateString;
        };

        const workData = {
            user_id: session.userId,
            company_name: tempWork.company,
            job_title: tempWork.role,
            start_date: formatDate(tempWork.start_date),
            end_date: (tempWork.current || !tempWork.end_date) ? null : formatDate(tempWork.end_date),
            is_current: tempWork.current,
            description: tempWork.description,
            company_logo_url: tempWork.company_logo_url,
            employment_type: tempWork.employment_type || null,
            skills: tempWork.skills.length > 0 ? tempWork.skills : null,
            achievements: tempWork.achievements.length > 0 ? tempWork.achievements : null
        };

        if (editingWorkIndex !== null && workExperienceList[editingWorkIndex]) {
            // Update
            const { error } = await supabase
                .from('work_experiences')
                .update(workData)
                .eq('id', workExperienceList[editingWorkIndex].id);
            if (error) throw error;
            toast.success('Experience updated');
        } else {
            // Insert
            const { error } = await supabase
                .from('work_experiences')
                .insert(workData);
            if (error) throw error;
            toast.success('Experience added');
        }

        fetchWorkExperiences();
        setShowWorkModal(false);
        setEditingWorkIndex(null);
        setTempWork({ 
            company: '', 
            role: '', 
            start_date: '', 
            end_date: '', 
            current: false, 
            description: '',
            company_logo_url: null,
            proof_documents: [],
            employment_type: '',
            skills: [],
            achievements: []
        });
        setWorkErrors({}); // Clear errors on successful save
    } catch (error: any) {
        console.error('Error saving work:', error);
        toast.error(`Failed to save experience: ${error.message || 'Unknown error'}`);
    } finally {
        setSaving(false);
    }
  };

  const handleRemoveWork = async (index: number) => {
    if (!workExperienceList[index]) return;
    
    try {
        const { error } = await supabase
            .from('work_experiences')
            .delete()
            .eq('id', workExperienceList[index].id);
            
        if (error) throw error;
        toast.success('Experience removed');
        fetchWorkExperiences();
    } catch (error) {
        console.error('Error removing work:', error);
        toast.error('Failed to remove experience');
    }
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

  const handleSaveEducation = () => {
    if (!tempEducation.school || !tempEducation.degree) {
      toast.error('School and Degree are required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      education: [...prev.education, tempEducation]
    }));

    setShowEducationModal(false);
    setTempEducation({ school: '', degree: '', field: '', start_year: '', end_year: '', description: '' });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
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

  const [workExperienceList, setWorkExperienceList] = useState<any[]>([]);

  const fetchWorkExperiences = async () => {
    try {
        const session = getSessionState();
        if (!session?.userId) return;

        const { data, error } = await supabase
            .from('work_experiences')
            .select('*')
            .eq('user_id', session.userId)
            .order('is_current', { ascending: false })
            .order('start_date', { ascending: false });

        if (error) throw error;
        setWorkExperienceList(data || []);
    } catch (error) {
        console.error('Error fetching work experiences:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchWorkExperiences();
  }, []);

  const startVerification = (expId: string) => {
    setVerifyingId(expId);
    setStep('email');
    setEmailInput('');
    setCodeInput('');
  };

  const handleSendCode = async () => {
    if (!emailInput.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('work-verification', {
        body: {
          action: 'send-code',
          experienceId: verifyingId,
          email: emailInput
        }
      });

      if (error) throw error;
      
      const result = data;
      if (result.success) {
        // Show appropriate message based on email delivery status
        if (result.email_sent) {
          toast.success(`✅ Verification email sent to ${emailInput}`, {
            description: 'Check your inbox and enter the 6-digit code'
          });
        } else if (result.debug_code) {
          toast.success(`Code generated: ${result.debug_code}`, {
            description: result.email_error || 'Email failed to send - use this code instead'
          });
        } else {
          toast.success('Code sent!');
        }
        setStep('code');
      } else {
        toast.error(result.error || 'Failed to send code');
      }
    } catch (error: any) {
        console.error('Error sending code:', error);
      toast.error(error.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setActionLoading(true);
    try {
       const { data, error } = await supabase.functions.invoke('work-verification', {
        body: {
          action: 'verify-code',
          experienceId: verifyingId,
          email: emailInput,
          code: codeInput
        }
      });

      if (error) throw error;

      const result = data;
      if (result.success) {
        toast.success('Work verification successful!');
        setVerifyingId(null);
        fetchWorkExperiences(); // Refresh list
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error: any) {
        console.error('Error verifying code:', error);
      toast.error(error.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };


  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ensure Valid Session
      const token = await ensureValidSession();
      if (!token) {
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
      let { data: profileData, error: profileError } = await (supabase
        .from('profiles') as any)
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
        } as any;
        profileError = null;
      }

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        name: (profileData as any)?.name || '',
        email: (profileData as any)?.email || '',
        phone: (profileData as any)?.phone || '',
        role: (profileData as any)?.job_title || '',
        bio: (profileData as any)?.bio || '',
        years_of_experience: (profileData as any)?.years_of_experience || '',
        industry: (profileData as any)?.industry || '',
        nationality: (profileData as any)?.nationality || '',
        city: (profileData as any)?.city || '',
        date_of_birth: (profileData as any)?.date_of_birth || '',
        gender: (profileData as any)?.gender || '',
        recovery_email: (profileData as any)?.recovery_email || '',
        linkedin: (profileData as any)?.linkedin || '',
        website: (profileData as any)?.website || '',
        booking_url: (profileData as any)?.booking_url || '',
        twitter: '',
        availability_status: (profileData as any)?.availability_status || 'actively_working',
        work_preference: (profileData as any)?.work_preference || 'remote',
        work_experience: (profileData as any)?.work_experience || [],
        skills: (profileData as any)?.skills || [],
        tools: (profileData as any)?.tools || [],
        industry_tags: (profileData as any)?.industry_tags || [],
        certifications: (profileData as any)?.certifications || []
      });

      // Handle custom role
      if (profileData?.job_title && !PROFESSIONAL_ROLES.includes(profileData.job_title)) {
        setIsCustomRole(true);
        setCustomRoleText(profileData.job_title);
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
    const { completion } = calculateProfileCompletion(data);
    setProfileCompleteness(completion);
    return completion;
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
      const { error: updateError } = await (supabase
        .from('profiles') as any)
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
      await ActivityTracker.profilePictureUploaded();

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

      const response = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const responseText = await response.text();

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
      const { completion } = calculateProfileCompletion(result.profile);
      setProfile({ 
        ...profile, 
        ...result.profile,
        profile_complete: completion >= 100,
        profile_completion_percentage: completion
      });
      setProfileCompleteness(completion);
      
      // Sync completion percentage to DB directly to ensure data consistency
      await (supabase.from('profiles') as any)
        .update({ 
          profile_completion_percentage: completion,
          profile_complete: completion >= 100
        })
        .eq('user_id', session.userId);

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

      // --- VALIDATION SECTION ---
      // 1. Full Name (Required, 2-100 chars)
      const nameError = validators.required(formData.name, 'Full Name') || 
                        validators.stringLength(formData.name, 2, 100, 'Full Name');
      if (nameError) {
        toast.error(nameError);
        setSaving(false);
        return;
      }

      // 2. Email (Required, Valid format)
      const emailError = validators.required(formData.email, 'Email address') || 
                         validators.email(formData.email);
      if (emailError) {
        toast.error(emailError);
        setSaving(false);
        return;
      }

      // 3. Phone (Optional, but if set must be valid)
      if (formData.phone) {
        const phoneError = validators.phone(formData.phone);
        if (phoneError) {
          toast.error(phoneError);
          setSaving(false);
          return;
        }
      }

      // 4. LinkedIn (Optional, but if set must be valid)
      if (formData.linkedin) {
        const lnError = validators.linkedinUrl(formData.linkedin);
        if (lnError) {
          toast.error(lnError);
          setSaving(false);
          return;
        }
      }

      // 5. Website (Optional, but if set must be valid)
      if (formData.website) {
        const webError = validators.url(formData.website, 'Website');
        if (webError) {
          toast.error(webError);
          setSaving(false);
          return;
        }
      }

      // 6. Booking URL (Optional, but if set must be valid)
      if ((formData as any).booking_url) {
        const bookingError = validators.url((formData as any).booking_url, 'Booking URL');
        if (bookingError) {
          toast.error(bookingError);
          setSaving(false);
          return;
        }
      }
      // --- END VALIDATION ---

      const roleToSave = isCustomRole ? customRoleText : formData.role;

      const updates = {
        ...formData,
        role: roleToSave,
        social_links: formData.social_links
      };


      // Construct the full URL to avoid proxy issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/profile-update`;

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
      const { completion } = calculateProfileCompletion(result.profile);
      setProfile({ 
        ...profile, 
        ...result.profile,
        profile_complete: completion >= 100,
        profile_completion_percentage: completion
      });
      setProfileCompleteness(completion);
      
      // Sync completion percentage to DB directly to ensure data consistency
      await (supabase.from('profiles') as any)
        .update({ 
          profile_completion_percentage: completion,
          profile_complete: completion >= 100
        })
        .eq('user_id', session.userId);

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      toast.success('Profile updated');

      // Track activity - determine what changed
      const changedFields: string[] = [];
      if (formData.name !== profile.name) changedFields.push('Name');
      if (formData.role !== profile.job_title) changedFields.push('Role');
      if (formData.bio !== profile.bio) changedFields.push('Bio');
      if (formData.industry !== profile.industry) changedFields.push('Industry');
      if (changedFields.length > 0) {
        await ActivityTracker.profileUpdated(changedFields);
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
      <div className="min-h-screen bg-white py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl space-y-8">
          {/* Header Skeleton */}
          <div className="rounded-2xl h-48 bg-slate-900 overflow-hidden relative p-8">
            <Skeleton className="h-6 w-32 bg-white/10 mb-6" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-6 w-48 bg-white/10" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>

          {/* Content Skeleton */}
          <div className="rounded-xl border border-slate-200 p-8 space-y-8">
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/30" style={{ paddingTop: '64px', paddingBottom: '24px' }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden relative mb-6 sm:mb-8 border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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

          <div className="relative z-10 p-3 sm:p-6 md:p-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-2 sm:mb-4 text-white/70 hover:text-white hover:bg-white/10 pl-0 group text-xs sm:text-sm md:text-base min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Back</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-1 sm:gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Manage Identity
              </h1>
              <span className="text-white/40 hidden sm:inline">•</span>
              <p className="text-white/80 text-sm sm:text-base md:text-lg">Your professional identity hub</p>
            </div>
          </div>
        </motion.div>

        {/* Message Banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                 message.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </div>
            <div className="flex items-center justify-between flex-1">
              <span className="font-semibold text-sm sm:text-base">{message.text}</span>
              <button 
                onClick={() => setMessage(null)} 
                className="hover:bg-black/5 p-1.5 rounded-xl transition-colors text-current/60 hover:text-current"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8 md:space-y-10 mt-3 sm:mt-6">
          <TabsList className="inline-flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 gap-1">
            <TabsTrigger 
              value="overview" 
              className="min-h-[40px] px-6 rounded-xl text-sm transition-all duration-300 data-[state=active]:shadow-sm"
              style={{
                color: activeTab === 'overview' ? colors.white : colors.neutral[600],
                backgroundColor: activeTab === 'overview' ? colors.black : 'transparent',
                fontWeight: '600'
              }}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="min-h-[40px] px-6 rounded-xl text-sm transition-all duration-300 data-[state=active]:shadow-sm"
              style={{
                color: activeTab === 'details' ? colors.white : colors.neutral[600],
                backgroundColor: activeTab === 'details' ? colors.black : 'transparent',
                fontWeight: '600'
              }}
            >
              <span className="hidden sm:inline">Personal & Professional</span>
              <span className="sm:hidden">Personal & Prof.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="work" 
              className="min-h-[40px] px-6 rounded-xl text-sm transition-all duration-300 data-[state=active]:shadow-sm"
              style={{
                color: activeTab === 'work' ? colors.white : colors.neutral[600],
                backgroundColor: activeTab === 'work' ? colors.black : 'transparent',
                fontWeight: '600'
              }}
            >
              Work Identity
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none" key="overview">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            {/* Identity Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />
              
              
              <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Identity Overview</h3>
                    <p className="text-slate-600 text-sm">Your verified profile and professional health</p>
                  </div>
                </div>

                
                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
                  <div className="flex-shrink-0 relative group/avatar">
                    <div 
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center cursor-pointer relative overflow-hidden ring-1 ring-slate-200 group-hover/avatar:ring-blue-500/50 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" loading="lazy" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <User className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto" />
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
                      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{formData.name || 'Not Set'}</h3>
                      <p className="text-blue-600 font-semibold text-lg">{formData.role || 'No Role Set'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto sm:mx-0">
                      <div 
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all"
                      >
                        <Phone className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold text-gray-900">{formData.phone || 'Not Set'}</span>
                      </div>
                      <div 
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all"
                      >
                        <Mail className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold text-gray-900 truncate">{formData.email || 'Not Set'}</span>
                      </div>
                    </div>

                    {/* PIN Display */}
                    {pinData && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="font-mono text-gray-900 font-bold tracking-widest text-lg">{pinData.pin_number}</span>
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 text-[10px] font-bold px-2 py-0.5 ml-2">
                          ACTIVE PIN
                        </Badge>
                      </div>
                    )}

                    {/* Social Links */}
                    {formData.social_links && formData.social_links.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {formData.social_links.map((link, index) => {
                          const Icon = {
                              linkedin: Linkedin,
                              twitter: Twitter,
                              github: Github,
                              instagram: Instagram,
                              facebook: Facebook,
                              youtube: Youtube,
                              website: Globe,
                              other: Globe
                          }[link.platform.toLowerCase()] || Globe;
                          
                          return (
                              <a 
                                key={index} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
                                title={link.platform}
                              >
                                  <Icon className="h-4 w-4" />
                              </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Profile Completeness */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Profile Strength</span>
                    <span className="text-sm font-bold text-blue-600">{profileCompleteness}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompleteness}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" 
                    />
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Identity Verification</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {profile?.email_verified ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-950">Email</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                        <span className="text-sm font-bold text-gray-600">Email</span>
                      </div>
                    )}
                    
                    {/* Placeholder badges for other verifications */}
                    {['Phone', 'Work', 'Identity'].map((item) => (
                      <div key={item} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                        <span className="text-sm font-bold text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </TabsContent>

            <TabsContent value="details" className="space-y-6" key="details">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 pointer-events-none" />
              
              
              <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm font-semibold">Full Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all h-11 sm:h-10 text-base" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-600 text-sm font-semibold">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all [color-scheme:light] h-11 sm:h-10 text-base" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-semibold">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all h-11 sm:h-10 text-base">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        <SelectItem value="male" className="focus:bg-gray-50 cursor-pointer">Male</SelectItem>
                        <SelectItem value="female" className="focus:bg-gray-50 cursor-pointer">Female</SelectItem>
                        <SelectItem value="non-binary" className="focus:bg-gray-50 cursor-pointer">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say" className="focus:bg-gray-50 cursor-pointer">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-semibold">Nationality</Label>
                    <Input 
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10" 
                      placeholder="e.g. Nigerian"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-semibold">City</Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10" 
                      placeholder="e.g. Lagos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm font-semibold">Phone Number</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Identity (Critical Section) */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-slate-900 flex items-center gap-2 text-lg">
                      <Phone className="h-5 w-5 text-blue-500" />
                      Contact Identity
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Manage your primary contact channels and verification status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Primary Identity: Phone */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 font-semibold text-sm">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        {profile?.phone_verified ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-200 rounded-full px-3">
                            <CheckCircle2 className="h-3 w-3 mr-1.5" /> Verified
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-3">
                              Unverified
                            </Badge>
                            {formData.phone && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 min-h-[32px] sm:h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 sm:px-3"
                                onClick={() => {
                                  setShowPhoneVerifyModal(true);
                                  setPhoneOTP('');
                                  setDevOTP(null);
                                }}
                              >
                                Verify Now
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative group flex items-center">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +234 801 234 5678"
                          className="bg-white border-slate-200 text-slate-900 pl-10 h-11 font-mono text-sm focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all shadow-sm pr-20" 
                        />
                        <div className="absolute right-1.5 top-1.5 bottom-1.5">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-full w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[class*="font-mono"]') as HTMLInputElement;
                              input?.focus();
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 pl-1">
                      This is your unique identifier on GidiPIN
                    </p>
                  </div>

                  {/* Primary Email */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 font-semibold text-sm">Email Address</Label>
                      {profile?.email_verified ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-200 rounded-full px-3">
                          <CheckCircle2 className="h-3 w-3 mr-1.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-3">
                          Unverified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border-gray-200 text-gray-900 pl-10 h-11 shadow-sm focus:border-blue-500 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>

                  {/* Recovery Email */}
                  <div className="space-y-3 md:col-span-2">
                    <Separator className="mb-6 bg-gray-100" />
                    <div className="max-w-md">
                      <Label className="text-gray-700 font-semibold text-sm mb-1.5 block">Recovery Email</Label>
                      <p className="text-xs text-gray-500 mb-3">Used for account recovery if you lose access to your primary email.</p>
                      
                      <div className="relative flex gap-3">
                        <div className="relative flex-1 group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          </div>
                          <Input 
                            value={formData.recovery_email || ''}
                            onChange={(e) => setFormData({ ...formData, recovery_email: e.target.value })}
                            className="bg-white border-gray-200 text-gray-900 pl-10 h-11 shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                            placeholder="backup@example.com"
                          />
                        </div>
                        <Button 
                          variant="outline"
                          className="h-11 px-4 border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                       <h3 className="text-sm font-semibold text-gray-900">Social Connections</h3>
                       <p className="text-xs text-gray-500">Connect your professional profiles to build trust</p>
                    </div>
                  </div>

                  {/* Social Links - Dark Card like HeroProfileCard */}
                  <motion.div
                    className="relative overflow-hidden rounded-xl"
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

                    <div className="relative z-10 p-6">
                      <SocialLinksEditor 
                        links={formData.social_links}
                        onChange={(links) => setFormData({ ...formData, social_links: links })}
                      />
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Availability & Work Preferences */}
            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    Availability & Work Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Set your current status and preferred professional arrangement
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Availability Status */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Current Status</Label>
                    <Select 
                      value={formData.availability_status} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        availability_status: value 
                      })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actively_working">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            Actively Working
                          </div>
                        </SelectItem>
                        <SelectItem value="open_to_work_fulltime">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            Open to Work (Full-Time)
                          </div>
                        </SelectItem>
                        <SelectItem value="open_to_contract">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            Open to Contract Roles
                          </div>
                        </SelectItem>
                        <SelectItem value="career_break">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            Career Break
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Preference */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Work Arrangement</Label>
                    <Select 
                      value={formData.work_preference} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        work_preference: value 
                      })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">🏠 Remote</SelectItem>
                        <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                        <SelectItem value="onsite">🏢 Onsite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info Banner based on selection */}
                {formData.availability_status === 'open_to_work_fulltime' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <CheckCircle2 className="inline h-4 w-4 mr-1" />
                      Your profile will be highlighted to employers seeking full-time talent
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Professional Summary
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    A brief overview of your professional role and background
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-gray-600 font-semibold mb-2 block">Professional Title</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => {
                      setFormData({ ...formData, role: value });
                      setIsCustomRole(value === 'Custom');
                      if (value !== 'Custom') setCustomRoleText('');
                    }}
                  >
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {PROFESSIONAL_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="text-gray-900">{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCustomRole && (
                    <Input 
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 mt-2 h-11 sm:h-10 text-base" 
                      placeholder="Enter your custom role"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-gray-600 font-semibold mb-2 block">Professional Bio</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 min-h-[120px] sm:min-h-[100px] text-base" 
                    placeholder="Tell us about your professional background..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-600 font-semibold mb-2 block">Years of Experience</Label>
                    <Input 
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10 text-base" 
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-600 font-semibold mb-2 block">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind.toLowerCase()} className="text-gray-900">{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-600 font-semibold mb-2 block">Work Preference</Label>
                    <Select value={formData.work_preference} onValueChange={(value) => setFormData({ ...formData, work_preference: value })}>
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {WORK_PREFERENCES.map((pref) => (
                          <SelectItem key={pref} value={pref} className="text-gray-900 capitalize">{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center sm:justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-black hover:bg-slate-800 text-white font-bold rounded-2xl w-full sm:w-auto min-h-[52px] px-10 text-base shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

              <TabsContent value="work" className="space-y-6" key="work">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
            {/* Work Experience Section with integrated Import */}
            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Work Experience
                  </CardTitle>
                  <p className="text-xs text-gray-500">Document your professional journey and verified roles</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                      size="sm"
                      className="flex-1 sm:flex-none bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      {isUploadingCV ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Import CV
                    </Button>
                    <Button 
                      onClick={() => setShowConnectModal(true)}
                      size="sm" 
                      variant="outline"
                      className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Payroll
                    </Button>
                    <Button 
                      onClick={() => setShowWorkModal(true)}
                      size="sm" 
                      className="flex-1 sm:flex-none bg-black hover:bg-gray-800 text-white border-0 shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {workExperienceList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                    </div>
                    <h4 className="text-slate-900 font-semibold mb-1">No work experience yet</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Add your professional roles or import from your CV to build your verified identity.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {workExperienceList.map((work, index) => (
                      <div key={work.id || index} className="group relative">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {work.company_logo_url ? (
                                        <img src={work.company_logo_url} alt={work.company_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 font-bold text-lg">{work.job_title}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="text-blue-600 font-medium">{work.company_name}</p>
                                <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:inline" />
                                <p className="text-gray-500 text-sm">
                                  {work.start_date} - {work.is_current ? 'Present' : work.end_date}
                                </p>
                            </div>
                            
                            {/* Verification Status */}
                            <div className="mt-2.5">
                                {work.verification_status === 'verified' ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1 pl-1 pr-2">
                                        <CheckCircle2 className="h-3 w-3" /> 
                                        {work.verification_source === 'hris_integration' ? 'Verified (Payroll)' : 'Verified Employee'}
                                    </Badge>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                                            Unverified
                                        </Badge>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                                            onClick={() => startVerification(work.id)}
                                        >
                                            Verify Work Email
                                        </Button>
                                    </div>
                                )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              onClick={() => {
                                setTempWork({
                                    company: work.company_name,
                                    role: work.job_title,
                                    start_date: work.start_date,
                                    end_date: work.end_date || '',
                                    current: work.is_current,
                                    description: work.description || '',
                                    company_logo_url: work.company_logo_url,
                                    proof_documents: [],
                                    employment_type: work.employment_type || '',
                                    skills: work.skills || [],
                                    achievements: work.achievements || []
                                });
                                setEditingWorkIndex(index);
                                setShowWorkModal(true);
                              }}
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Pencil className="h-4.5 w-4.5" />
                            </Button>
                            <Button 
                              onClick={() => handleRemoveWork(index)}
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                   
                        </div>
                        {work.description && (
                          <div className="mt-4 ml-16">
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {work.description}
                            </p>
                          </div>
                        )}
                        {index < workExperienceList.length - 1 && (
                            <Separator className="mt-6 bg-slate-100" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              {/* Verification Modal */}
              <Dialog open={!!verifyingId} onOpenChange={(open) => !open && setVerifyingId(null)}>
                <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-center text-slate-900">Verify Work Email</DialogTitle>
                        <div className="text-center text-slate-500 text-sm">
                            {step === 'email' 
                                ? 'Enter your work email address to receive a verification code.' 
                                : 'Enter the 6-digit code sent to your email.'}
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {step === 'email' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Company Email</label>
                                <Input 
                                    placeholder="you@company.com" 
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="bg-white border-slate-200 text-slate-900"
                                />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Verification Code</label>
                                <Input 
                                    placeholder="123456" 
                                    className="text-center text-lg tracking-widest bg-white border-slate-200 text-slate-900"
                                    maxLength={6}
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {step === 'email' ? (
                            <Button onClick={handleSendCode} disabled={actionLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Button variant="ghost" onClick={() => setStep('email')} disabled={actionLoading} className="text-slate-600">
                                    Back
                                </Button>
                                <Button onClick={handleVerifyCode} disabled={actionLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>

            <HRISConnectModal 
                open={showConnectModal}
                onOpenChange={setShowConnectModal}
                onSuccess={handleHRISSuccess}
            />

            {/* Education Section */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Education
                </CardTitle>
                <Button 
                  onClick={() => setShowEducationModal(true)}
                  size="sm" 
                  className="bg-black hover:bg-gray-800 text-white border-0 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {(formData.education || []).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <GraduationCap className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-gray-900 font-semibold mb-1">No education added</h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Add your academic background and certifications to complete your profile.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(formData.education || []).map((edu, index) => (
                      <div key={index} className="group relative">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <Building className="h-6 w-6 text-gray-400" />
                                </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 font-bold text-lg">{edu.school}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="text-blue-600 font-medium">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
                                <p className="text-slate-500 text-sm">
                                  {edu.start_year} - {edu.end_year || 'Present'}
                                </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              onClick={() => {
                                setTempEducation(edu);
                                handleRemoveEducation(index);
                                setShowEducationModal(true);
                              }}
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Pencil className="h-4.5 w-4.5" />
                            </Button>
                            <Button 
                              onClick={() => handleRemoveEducation(index)}
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </div>
                        {edu.description && (
                          <div className="mt-4 ml-16">
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {edu.description}
                            </p>
                          </div>
                        )}
                        {index < (formData.education || []).length - 1 && (
                            <Separator className="mt-6 bg-slate-100" />
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
              <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50">
                  <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-blue-500" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('skills', skillInput, setSkillInput)}
                        placeholder="e.g. React"
                        className="bg-white border-slate-200 text-slate-900 h-10"
                      />
                      <Button 
                        onClick={() => handleAddTag('skills', skillInput, setSkillInput)}
                        variant="secondary"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-900 h-10 px-4"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 px-2 py-1 gap-1 rounded-md transition-all">
                          {skill}
                          <button onClick={() => handleRemoveTag('skills', skill)} className="ml-1 hover:text-blue-800 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50">
                  <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                    <Settings className="h-4.5 w-4.5 text-purple-500" />
                    Tools & Software
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('tools', toolInput, setToolInput)}
                        placeholder="e.g. Figma"
                        className="bg-white border-slate-200 text-slate-900 h-10"
                      />
                      <Button 
                        onClick={() => handleAddTag('tools', toolInput, setToolInput)}
                        variant="secondary"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-900 h-10 px-4"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tools.map((tool) => (
                        <Badge key={tool} className="bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 px-2 py-1 gap-1 rounded-md transition-all">
                          {tool}
                          <button onClick={() => handleRemoveTag('tools', tool)} className="ml-1 hover:text-purple-800 transition-colors">
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
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-emerald-500" />
                  Industry Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      placeholder="e.g. Fintech"
                      className="bg-white border-slate-200 text-slate-900 h-10"
                    />
                    <Button 
                      onClick={() => handleAddTag('industry_tags', industryInput, setIndustryInput)}
                      variant="secondary"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-900 h-10 px-4"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.industry_tags.map((tag) => (
                      <Badge key={tag} className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 px-2 py-1 gap-1 rounded-md transition-all">
                        {tag}
                        <button onClick={() => handleRemoveTag('industry_tags', tag)} className="ml-1 hover:text-emerald-800 transition-colors">
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
                <CardTitle className="text-gray-900 flex items-center gap-2">
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
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
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
                className="bg-black hover:bg-slate-800 text-white font-semibold shadow-md px-8 py-6 rounded-2xl transition-all active:scale-95"
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
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>

        {/* Work Experience Modal */}
        <Dialog open={showWorkModal} onOpenChange={setShowWorkModal}>
          <DialogContent className="w-full h-full sm:h-auto sm:max-w-[500px] sm:max-h-[85vh] flex flex-col p-0 gap-0 bg-white border-gray-200 text-gray-900">
            <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg">{editingWorkIndex !== null ? 'Edit Position' : 'Add Position'}</DialogTitle>
            </DialogHeader>
            
            {/* Tabbed Content */}
            <Tabs value={workModalTab} onValueChange={setWorkModalTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 mx-4 sm:mx-6 mt-2 sm:mt-4 mb-2 flex-shrink-0">
                <TabsTrigger value="basic" className="text-[10px] sm:text-sm text-black font-semibold">Basic Info</TabsTrigger>
                <TabsTrigger value="details" className="text-[10px] sm:text-sm text-black font-semibold">Details</TabsTrigger>
                <TabsTrigger value="proof" className="text-[10px] sm:text-sm text-black font-semibold">Proof</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4 mt-2 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</Label>
                    <Input 
                      value={tempWork.company}
                      onChange={(e) => setTempWork({ ...tempWork, company: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 h-11 sm:h-9 text-base sm:text-sm"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role/Title</Label>
                    <Input 
                      value={tempWork.role}
                      onChange={(e) => setTempWork({ ...tempWork, role: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 h-11 sm:h-9 text-base sm:text-sm"
                      placeholder="e.g. Senior Engineer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</Label>
                    <Input 
                      type="month"
                      value={tempWork.start_date}
                      onChange={(e) => setTempWork({ ...tempWork, start_date: e.target.value })}
                      className="bg-white border-gray-200 text-gray-900 h-11 sm:h-9 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</Label>
                    <Input 
                      type="month"
                      value={tempWork.end_date}
                      onChange={(e) => setTempWork({ ...tempWork, end_date: e.target.value })}
                      disabled={tempWork.current}
                      className="bg-white border-gray-200 text-gray-900 h-11 sm:h-9 text-base sm:text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTempWork({ ...tempWork, current: !tempWork.current })}
                    className={`px-4 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-all ${
                      tempWork.current 
                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tempWork.current ? '✓ Current Role' : 'Mark as Current'}
                  </button>
                </div>

                {/* Employment Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employment Type</Label>
                  <Select
                    value={tempWork.employment_type}
                    onValueChange={(value) => setTempWork({...tempWork, employment_type: value as EmploymentType})}
                  >
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-11 sm:h-9 text-base sm:text-sm">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Tab 2: Details (Description, Skills, Achievements) */}
              <TabsContent value="details" className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4 mt-2 min-h-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
                  <Textarea 
                    value={tempWork.description}
                    onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900 min-h-[80px] text-base sm:text-sm resize-none"
                    placeholder="Briefly describe your responsibilities..."
                  />
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <TagInput
                    label="Skills"
                    value={tempWork.skills}
                    onChange={(skills) => setTempWork({...tempWork, skills})}
                    placeholder="Type a skill and press Enter"
                  />
                </div>

                {/* Key Achievements */}
                <div className="space-y-1.5">
                  <DynamicListInput
                    label="Key Achievements"
                    items={tempWork.achievements}
                    onItemsChange={(achievements) => setTempWork({...tempWork, achievements})}
                    placeholder="Describe a major accomplishment..."
                    helpText="Highlight your notable contributions"
                    maxItems={10}
                    minRows={2}
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Proof (Logo & Documents) */}
              <TabsContent value="proof" className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4 mt-2 min-h-0">
                {/* Company Logo Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Logo</Label>
                  <div className="scale-95 sm:scale-90 origin-left">
                      <CompanyLogoUpload
                      companyName={tempWork.company}
                      currentLogoUrl={tempWork.company_logo_url || null}
                      onChange={(url) => setTempWork({ ...tempWork, company_logo_url: url })}
                      userId={profile?.user_id || ''}
                      />
                  </div>
                </div>

                {/* Proof of Work Documents */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proof of Work</Label>
                      <span className="text-[10px] text-gray-400">Optional</span>
                  </div>
                  <div className="scale-95 origin-top-left">
                      <ProofDocumentUpload
                      documents={tempWork.proof_documents || []}
                      onChange={(docs) => setTempWork({ ...tempWork, proof_documents: docs })}
                      userId={profile?.user_id || ''}
                      maxFiles={5}
                      />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setShowWorkModal(false)} className="flex-1 sm:flex-none h-11 sm:h-9 border-gray-200 text-gray-700 hover:bg-gray-50 text-base sm:text-sm">Cancel</Button>
              <Button onClick={handleSaveWork} className="flex-1 sm:flex-none h-11 sm:h-9 bg-white hover:bg-gray-50 text-black border-2 border-black text-base sm:text-sm px-6 font-semibold">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Education Modal */}
        <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
          <DialogContent className="bg-white border-gray-200 text-gray-900 w-full sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>School / University</Label>
                <Input 
                  value={tempEducation.school}
                  onChange={(e) => setTempEducation({ ...tempEducation, school: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900"
                  placeholder="e.g. University of Lagos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input 
                    value={tempEducation.degree}
                    onChange={(e) => setTempEducation({ ...tempEducation, degree: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900"
                    placeholder="e.g. BSc"
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input 
                    value={tempEducation.field}
                    onChange={(e) => setTempEducation({ ...tempEducation, field: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Year</Label>
                  <Input 
                    type="number"
                    value={tempEducation.start_year}
                    onChange={(e) => setTempEducation({ ...tempEducation, start_year: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <Label>End Year</Label>
                  <Input 
                    type="number"
                    value={tempEducation.end_year}
                    onChange={(e) => setTempEducation({ ...tempEducation, end_year: e.target.value })}
                    className="bg-white border-gray-200 text-gray-900"
                    placeholder="2022"
                  />
                </div>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea 
                  value={tempEducation.description}
                  onChange={(e) => setTempEducation({ ...tempEducation, description: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900 min-h-[80px]"
                  placeholder="Activities, societies, honors..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEducationModal(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</Button>
              <Button onClick={handleSaveEducation} className="bg-blue-600 hover:bg-blue-700 text-white">Save Education</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certification Modal */}
        <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
          <DialogContent className="bg-white border-gray-200 text-gray-900 w-full sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Certification Name</Label>
                <Input 
                  value={tempCert.name}
                  onChange={(e) => setTempCert({ ...tempCert, name: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <Label>Issuing Organization</Label>
                <Input 
                  value={tempCert.issuer}
                  onChange={(e) => setTempCert({ ...tempCert, issuer: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <Label>Date Issued</Label>
                <Input 
                  type="month"
                  value={tempCert.date}
                  onChange={(e) => setTempCert({ ...tempCert, date: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900"
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

        {/* Phone Verification Modal */}
        <Dialog open={showPhoneVerifyModal} onOpenChange={setShowPhoneVerifyModal}>
          <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-center text-slate-900">Verify Phone Number</DialogTitle>
              <div className="text-center text-slate-500 text-sm">
                We'll send a verification code to {formData.phone}
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Verification Code</label>
                <Input 
                  placeholder="Enter 6-digit code" 
                  className="text-center text-lg tracking-widest bg-white border-slate-200 text-slate-900"
                  maxLength={6}
                  value={phoneOTP}
                  onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                />
                {devOTP && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-800 text-center font-mono">
                      [DEV MODE] Your code: <span className="font-bold">{devOTP}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    setSendingOTP(true);
                    const token = await ensureValidSession();
                    const result = await api.sendPhoneOTP(formData.phone, token);
                    setDevOTP(result._dev_otp);
                    toast.success('Verification code sent!', {
                      description: result._dev_otp ? 'Check the yellow box above' : 'Check your phone for the code'
                    });
                  } catch (error: any) {
                    handleApiError(error, 'Failed to send code');
                  } finally {
                    setSendingOTP(false);
                  }
                }}
                disabled={sendingOTP || verifyingOTP}
                className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {sendingOTP ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Code'}
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    setVerifyingOTP(true);
                    const token = await ensureValidSession();
                    await api.verifyPhoneOTP(formData.phone, phoneOTP, token);
                    
                    // Update local state
                    setProfile({ ...profile, phone_verified: true });
                    toast.success('Phone verified successfully!', {
                      description: 'Your phone number has been verified.'
                    });
                    
                    // Close modal and reset
                    setShowPhoneVerifyModal(false);
                    setPhoneOTP('');
                    setDevOTP(null);
                    
                    // Reload to update badge
                    setTimeout(() => window.location.reload(), 1000);
                  } catch (error: any) {
                    handleApiError(error, 'Verification failed');
                  } finally {
                    setVerifyingOTP(false);
                  }
                }}
                disabled={phoneOTP.length !== 6 || sendingOTP || verifyingOTP}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {verifyingOTP ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
