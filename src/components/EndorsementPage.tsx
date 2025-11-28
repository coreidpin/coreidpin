import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, User, Briefcase, Star, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { supabase } from '../utils/supabase/client';
import { EndorsementAPI } from '../utils/endorsementAPI';
import type { ProfessionalEndorsement } from '../types/endorsement';

export function EndorsementPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [endorsement, setEndorsement] = useState<ProfessionalEndorsement | null>(null);
  const [professionalName, setProfessionalName] = useState<string>('The professional');
  
  // Form state
  const [formData, setFormData] = useState({
    headline: '',
    text: '',
    rating: 5,
    endorser_name: '',
    endorser_role: '',
    endorser_company: '',
    endorser_linkedin_url: ''
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid endorsement link');
        setLoading(false);
        return;
      }

      try {
        // Fetch endorsement details by token
        const { data, error } = await supabase
          .from('professional_endorsements_v2')
          .select(`
            *,
            professional:professional_id (
              raw_user_meta_data
            )
          `)
          .eq('verification_token', token)
          .single();

        if (error || !data) {
          setError('This endorsement link is invalid or has expired.');
          setLoading(false);
          return;
        }

        if (data.status === 'accepted' || data.status === 'rejected') {
          setError('This endorsement request has already been processed.');
          setLoading(false);
          return;
        }

        setEndorsement(data);
        
        // Pre-fill form with known data
        setFormData(prev => ({
          ...prev,
          endorser_name: data.endorser_name || '',
          endorser_role: data.endorser_role || '',
          endorser_company: data.endorser_company || '',
          endorser_linkedin_url: data.endorser_linkedin_url || ''
        }));

        // Get professional's name
        const meta = data.professional?.raw_user_meta_data;
        if (meta?.name || meta?.full_name) {
          setProfessionalName(meta.name || meta.full_name);
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !endorsement) return;

    if (!formData.text || formData.text.length < 50) {
      toast.error('Please provide a more detailed endorsement (at least 50 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const result = await EndorsementAPI.submitEndorsement(token, {
        text: formData.text,
        headline: formData.headline,
        endorser_name: formData.endorser_name,
        endorser_role: formData.endorser_role,
        endorser_company: formData.endorser_company,
        endorser_linkedin_url: formData.endorser_linkedin_url
      });

      if (result.success) {
        setSuccess(true);
        toast.success('Endorsement submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit endorsement');
      }
    } catch (err) {
      console.error('Error submitting endorsement:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
          <p className="text-gray-500">Verifying endorsement link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-lg border-red-100">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Link Invalid or Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            <p>{error}</p>
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white shadow-lg border-green-100">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Thank You!</CardTitle>
              <CardDescription className="text-lg">
                Your endorsement for {professionalName} has been submitted.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-gray-600 pt-4">
              <p>Your feedback helps build trust in the professional community.</p>
            </CardContent>
            <CardFooter className="justify-center pt-6">
              <Button onClick={() => navigate('/')} className="bg-black text-white hover:bg-gray-800">
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Endorse {professionalName}</h1>
          <p className="mt-2 text-gray-600">Please share your professional experience working together.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Context Column */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {endorsement?.project_context && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Project Context</h4>
                    <p className="text-sm text-gray-600">{endorsement.project_context}</p>
                  </div>
                )}
                
                {endorsement?.metadata?.custom_message && (
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-700 mb-1 uppercase">Message from {professionalName}</h4>
                    <p className="text-sm text-blue-800 italic">"{endorsement.metadata.custom_message}"</p>
                  </div>
                )}

                {endorsement?.skills_endorsed && endorsement.skills_endorsed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {endorsement.skills_endorsed.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Write your endorsement</CardTitle>
                  <CardDescription>
                    Your testimonial will appear on {professionalName}'s profile after approval.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Endorser Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="name" 
                          value={formData.endorser_name} 
                          onChange={e => setFormData({...formData, endorser_name: e.target.value})}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="role" 
                          value={formData.endorser_role} 
                          onChange={e => setFormData({...formData, endorser_role: e.target.value})}
                          className="pl-9"
                          placeholder="e.g. Senior Manager"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        value={formData.endorser_company} 
                        onChange={e => setFormData({...formData, endorser_company: e.target.value})}
                        placeholder="Where you worked together"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                      <Input 
                        id="linkedin" 
                        value={formData.endorser_linkedin_url} 
                        onChange={e => setFormData({...formData, endorser_linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline (Optional)</Label>
                    <Input 
                      id="headline" 
                      value={formData.headline} 
                      onChange={e => setFormData({...formData, headline: e.target.value})}
                      placeholder="e.g. Exceptional leader and mentor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text">Endorsement *</Label>
                    <Textarea 
                      id="text" 
                      value={formData.text} 
                      onChange={e => setFormData({...formData, text: e.target.value})}
                      placeholder="Share your experience working with them..."
                      className="min-h-[150px]"
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {formData.text.length} characters (min 50)
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6">
                  <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || formData.text.length < 50} className="bg-black text-white hover:bg-gray-800">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Endorsement
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
