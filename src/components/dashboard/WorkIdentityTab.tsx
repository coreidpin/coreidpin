import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { TagInput } from '../ui/TagInput';
import { DynamicListInput } from '../ui/DynamicListInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Building2, CheckCircle2, Shield, Loader2, Lock, Mail, Plus } from 'lucide-react';
import { supabase, supabaseUrl } from '../../utils/supabase/client';
import { ensureValidSession } from '../../utils/session';
import { toast } from 'sonner';
import { EMPLOYMENT_TYPE_OPTIONS } from '../../utils/employmentTypes';
import type { EmploymentType } from '../../utils/employmentTypes';

interface WorkIdentityTabProps {
  userId: string;
}

export function WorkIdentityTab({ userId }: WorkIdentityTabProps) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [actionLoading, setActionLoading] = useState(false);

  // Add Experience State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExp, setNewExp] = useState({
      company_name: '',
      job_title: '',
      start_date: '',
      end_date: '',
      is_current: false,
      employment_type: '' as EmploymentType | '',
      skills: [] as string[],
      achievements: [] as string[]
  });

  useEffect(() => {
    fetchExperiences();
  }, [userId]);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId)
        .order('is_current', { ascending: false }) // Current jobs first
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.company_name || !newExp.job_title || !newExp.start_date) {
        toast.error('Please fill in required fields');
        return;
    }

    setActionLoading(true);
    try {
        const { error } = await supabase
            .from('work_experiences')
            .insert({
                user_id: userId,
                company_name: newExp.company_name,
                job_title: newExp.job_title,
                start_date: newExp.start_date,
                end_date: newExp.is_current ? null : newExp.end_date,
                is_current: newExp.is_current,
                employment_type: newExp.employment_type || null,
                skills: newExp.skills.length > 0 ? newExp.skills : null,
                achievements: newExp.achievements.length > 0 ? newExp.achievements : null
            });

        if (error) throw error;

        toast.success('Experience added successfully');
        setShowAddModal(false);
        setNewExp({
            company_name: '',
            job_title: '',
            start_date: '',
            end_date: '',
            is_current: false,
            employment_type: '',
            skills: [],
            achievements: []
        });
        fetchExperiences();
    } catch (error) {
        console.error('Error adding experience:', error);
        toast.error('Failed to add experience');
    } finally {
        setActionLoading(false);
    }
  };

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
      const accessToken = await ensureValidSession();
      if (!accessToken) throw new Error('Authentication failed');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/work-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'send-code',
          experienceId: verifyingId,
          email: emailInput
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Code sent! (Debug: ${result.debug_code})`);
        setStep('code');
      } else {
        toast.error(result.error || 'Failed to send code');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setActionLoading(true);
    try {
       const accessToken = await ensureValidSession();
       if (!accessToken) throw new Error('Authentication failed');

       const response = await fetch(`${supabaseUrl}/functions/v1/work-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'verify-code',
          experienceId: verifyingId,
          email: emailInput,
          code: codeInput
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Work verification successful!');
        setVerifyingId(null);
        fetchExperiences(); // Refresh list
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
           {/* Header Content */}
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 flex-1 mr-4">
            <div>
               <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                 <Shield className="h-5 w-5" />
                 Work Identity Verification
               </h3>
               <p className="text-sm text-blue-700 mt-1">
                 Verify your employment email to earn the "Verified Employee" badge and boost your trust score.
               </p>
            </div>
            <div className="bg-white/50 px-4 py-2 rounded-lg border border-blue-100 text-center">
                 <div className="text-2xl font-bold text-blue-600">
                   {experiences.filter(e => e.verification_status === 'verified').length} / {experiences.length}
                 </div>
                 <div className="text-xs font-medium text-blue-500 uppercase tracking-wider">Roles Verified</div>
            </div>
           </div>
           
           <Button onClick={() => setShowAddModal(true)} className="h-full py-6">
             <Plus className="h-4 w-4 mr-2" /> Add Role
           </Button>
      </div>

      <div className="grid gap-6">
        {experiences.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No work experience yet</h3>
                <p className="text-gray-500 mb-6">Add your current or past roles to get verified.</p>
                <Button onClick={() => setShowAddModal(true)}>
                    Add Work Experience
                </Button>
            </div>
        ) : (
            experiences.map((exp) => (
              <Card key={exp.id} className="overflow-hidden border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                   <div className="flex flex-col sm:flex-row">
                      {/* Left Stripe */}
                      <div className={`w-full sm:w-2 h-2 sm:h-auto ${
                          exp.verification_status === 'verified' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                      
                      <div className="p-6 flex-1">
                          <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                      {exp.company_logo_url ? (
                                        <img src={exp.company_logo_url} className="h-8 w-8 object-contain" />
                                      ) : (
                                        <Building2 className="h-6 w-6 text-gray-400" />
                                      )}
                                  </div>
                                  <div>
                                      <h4 className="text-lg font-bold text-gray-900">{exp.job_title}</h4>
                                      <div className="text-gray-600 font-medium">{exp.company_name}</div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()}
                                      </div>
                                  </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                  {exp.verification_status === 'verified' ? (
                                      <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1 pl-1 pr-2.5 py-1">
                                          <div className="bg-green-500 rounded-full p-0.5">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                          </div>
                                          Verified Employee
                                      </Badge>
                                  ) : (
                                      <Badge variant="outline" className="bg-gray-50 text-gray-500 gap-1 border-gray-200">
                                          Unverified
                                      </Badge>
                                  )}
                              </div>
                          </div>

                          {/* Verification Section */}
                          {exp.verification_status !== 'verified' && (
                              <div className="mt-6 pt-6 border-t border-gray-50">
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                      <div className="text-sm text-gray-500 flex items-center gap-2">
                                         <Lock className="h-4 w-4 text-gray-400" />
                                         Verify ownership of a company email address (e.g. name@{exp.company_name.toLowerCase().replace(/\s+/g,'')}.com)
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                        onClick={() => startVerification(exp.id)}
                                      >
                                        Verify Work Email
                                      </Button>
                                  </div>
                              </div>
                          )}
                      </div>
                   </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Add Experience Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Work Experience</DialogTitle>
                <DialogDescription>Add details about your current or past role.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input value={newExp.company_name} onChange={e => setNewExp({...newExp, company_name: e.target.value})} placeholder="e.g. Google" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input value={newExp.job_title} onChange={e => setNewExp({...newExp, job_title: e.target.value})} placeholder="e.g. Senior Product Manager" />
                </div>
                
                {/* 🆕 Employment Type */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Employment Type</Label>
                    <Select
                        value={newExp.employment_type}
                        onValueChange={(value) => setNewExp({...newExp, employment_type: value as EmploymentType})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                            {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input type="date" value={newExp.start_date} onChange={e => setNewExp({...newExp, start_date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input type="date" value={newExp.end_date} onChange={e => setNewExp({...newExp, end_date: e.target.value})} disabled={newExp.is_current} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_current" checked={newExp.is_current} onChange={e => setNewExp({...newExp, is_current: e.target.checked})} />
                    <label htmlFor="is_current" className="text-sm">I currently work here</label>
                </div>

                {/* 🆕 Skills */}
                <TagInput
                    label="Skills"
                    value={newExp.skills}
                    onChange={(skills) => setNewExp({...newExp, skills})}
                    placeholder="Type a skill and press Enter"
                />

                {/* 🆕 Achievements */}
                <DynamicListInput
                    label="Key Achievements"
                    items={newExp.achievements}
                    onItemsChange={(achievements) => setNewExp({...newExp, achievements})}
                    placeholder="Describe a major accomplishment in this role..."
                    helpText="Highlight your notable contributions and impacts"
                    maxItems={10}
                    minRows={3}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={handleAddExperience} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Experience'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <Dialog open={!!verifyingId} onOpenChange={(open) => !open && setVerifyingId(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <DialogTitle className="text-center">Verify Work Email</DialogTitle>
                <DialogDescription className="text-center">
                    {step === 'email' 
                        ? 'Enter your work email address to receive a verification code.' 
                        : 'Enter the 6-digit code sent to your email.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {step === 'email' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700">Company Email</label>
                           <Input 
                              placeholder="you@company.com" 
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                           />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700">Verification Code</label>
                           <Input 
                              placeholder="123456" 
                              className="text-center text-lg tracking-widest"
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
                    <Button onClick={handleSendCode} disabled={actionLoading} className="w-full bg-blue-600">
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
                    </Button>
                ) : (
                    <div className="flex gap-2 w-full">
                         <Button variant="ghost" onClick={() => setStep('email')} disabled={actionLoading}>
                             Back
                         </Button>
                         <Button onClick={handleVerifyCode} disabled={actionLoading} className="flex-1 bg-blue-600">
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                        </Button>
                    </div>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
