import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, Phone, Mail, Briefcase, MapPin, Calendar,
  CheckCircle2, ExternalLink, Globe
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export const PublicProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pin, setPin] = useState<any>(null);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);

      // Fetch public profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_url_slug', slug)
        .eq('public_profile_enabled', true)
        .single();

      if (profileError || !profileData) {
        toast.error('Profile not found');
        navigate('/');
        return;
      }

      setProfile(profileData);

      // Fetch PIN if verified
      const { data: pinData } = await supabase
        .from('professional_pins')
        .select('pin_number, verification_status, trust_score')
        .eq('user_id', profileData.user_id)
        .eq('verification_status', 'verified')
        .single();

      if (pinData) {
        setPin(pinData);
      }

      // Fetch work experiences
      const { data: experiences } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('start_date', { ascending: false })
        .limit(5);

      if (experiences) {
        setWorkExperiences(experiences);
      }

      // Log view analytics
      await supabase.from('profile_shares').insert({
        user_id: profileData.user_id,
        shared_via: 'link',
        viewer_ip: null
      });

    } catch (error) {
      console.error('Error fetching public profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32f08c]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <Card className="bg-[#0e0f12] border-[#1a1b1f]/50 max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-white/60">This profile doesn't exist or has been made private.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <Card className="bg-gradient-to-br from-[#32f08c]/10 via-[#0e0f12] to-[#bfa5ff]/10 border-[#32f08c]/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {profile.profile_picture_url ? (
                    <img 
                      src={profile.profile_picture_url} 
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#32f08c]/30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                      <Shield className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                      {pin && (
                        <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl text-white/90">{profile.role}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile.city && (
                      <div className="flex items-center gap-2 text-white/80">
                        <MapPin className="h-4 w-4 text-[#32f08c]" />
                        {profile.city}
                      </div>
                    )}
                    {profile.industry && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Briefcase className="h-4 w-4 text-[#32f08c]" />
                        {profile.industry}
                      </div>
                    )}
                    {profile.years_of_experience && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="h-4 w-4 text-[#32f08c]" />
                        {profile.years_of_experience} years exp.
                      </div>
                    )}
                  </div>

                  {/* PIN Display */}
                  {pin && (
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Professional PIN</div>
                        <div className="text-lg font-mono font-bold text-white">{pin.pin_number}</div>
                      </div>
                      <Separator orientation="vertical" className="h-8 bg-white/10" />
                      <div>
                        <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Trust Score</div>
                        <div className="text-lg font-bold text-[#32f08c]">{pin.trust_score}/100</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <>
                  <Separator className="my-6 bg-white/10" />
                  <p className="text-white/90 leading-relaxed">{profile.bio}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          {workExperiences.length > 0 && (
            <Card className="bg-[#0e0f12]/80 border-[#1a1b1f]/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#32f08c]" />
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {workExperiences.map((exp, index) => (
                    <div key={exp.id}>
                      {index > 0 && <Separator className="my-4 bg-white/10" />}
                      <div>
                        <h3 className="font-semibold text-white">{exp.job_title}</h3>
                        <p className="text-white/80">{exp.company_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-white/80 text-sm">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-white/60 py-6">
            <p>Powered by <span className="text-[#32f08c] font-semibold">CoreID</span></p>
            <p className="mt-2">Verified professional identity you can trust</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
