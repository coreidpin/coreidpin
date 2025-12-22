import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Phone, Mail, Briefcase, MapPin, Calendar,
  CheckCircle2, ExternalLink, Globe, FolderOpen,
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { CaseStudyViewer } from './portfolio/CaseStudyViewer';
import { WorkTimeline } from './portfolio/WorkTimeline';
import { BetaBadge } from './ui/BetaBadge';
import { TopTalentBadge } from './ui/TopTalentBadge';
import { ContributionBadge } from './ui/ContributionBadge';
import { ContactModal } from './public/ContactModal';

export const PublicProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pin, setPin] = useState<any>(null);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);

      // Fetch public profile by slug
      const { data: profileData, error: profileError } = await (supabase
        .from('profiles')
        .select('*') as any)
        .eq('profile_url_slug', slug)
        .eq('public_profile_enabled', true)
        .single();

      // Cast to any to avoid TS inference errors
      const profileInfo = profileData as any;

      if (profileError || !profileInfo) {
        toast.error('Profile not found');
        navigate('/');
        return;
      }

      setProfile(profileInfo);

      // Fetch PIN if verified
      const { data: pinData } = await supabase
        .from('professional_pins')
        .select('pin_number, verification_status, trust_score')
        .eq('user_id', profileInfo.user_id)
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

      // Fetch portfolio projects
      const { data: projectsData } = await supabase
        .from('professional_projects')
        .select('*')
        .eq('user_id', profileData.user_id)
        .eq('is_portfolio_visible', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (projectsData) {
        setProjects(projectsData);
      }

      // Log view analytics
      await (supabase.from('profile_shares') as any).insert({
        user_id: profileInfo.user_id,
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
    <div className="min-h-screen bg-[#0a0b0d] text-white py-12 relative">
      {/* Back Button - Fixed for visibility */}
      <Button
        variant="outline" 
        className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <Card className="bg-[#0e0f12] border-[#32f08c]/30 overflow-hidden relative">
            {/* Cover Image */}
            <div 
              className="h-48 w-full bg-cover bg-center relative"
              style={{ 
                backgroundImage: profile.cover_image_url 
                  ? `url(${profile.cover_image_url})` 
                  : 'linear-gradient(to right bottom, #32f08c1a, #0e0f12, #bfa5ff1a)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] to-transparent opacity-60" />
            </div>

            <CardContent className="px-8 pb-8 pt-0 relative flex flex-col items-center">
              {/* Profile Picture - Centered Overlapping */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                {profile.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#0e0f12] shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#1a1b1f] border-4 border-[#0e0f12] flex items-center justify-center shadow-xl">
                    <Shield className="h-16 w-16 text-white/40" />
                  </div>
                )}
              </div>

              {/* Main Info Section - Centered */}
              <div className="mt-20 w-full flex flex-col items-center text-center">
                
                {/* Name & Details */}
                <div className="space-y-2 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    {pin && (
                      <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30 h-6">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <BetaBadge className="h-6" />
                    <TopTalentBadge className="h-6" />
                  </div>
                  <p className="text-xl text-white/90 font-medium">{profile.role}</p>

                  <div className="pt-4 pb-2">
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => {
                          console.log('Contact Me clicked! Setting showContactModal to true');
                          setShowContactModal(true);
                        }}
                        className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Contact Me
                      </Button>
                      
                      {profile.booking_url && (
                        <Button 
                          onClick={() => window.open(profile.booking_url, '_blank')}
                          className="bg-[#32f08c] text-black hover:bg-[#32f08c]/90 font-semibold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(50,240,140,0.3)] transition-all hover:scale-105"
                        >
                          <Calendar className="mr-2 h-5 w-5" />
                          Book Call
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  {profile.social_links && profile.social_links.length > 0 && (
                    <div className="flex gap-4 mb-6">
                      {profile.social_links.map((link: any, index: number) => {
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
                             className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all hover:scale-110 border border-white/5 hover:border-[#32f08c]/30"
                           >
                             <Icon className="h-5 w-5" />
                           </a>
                         );
                      })}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 pt-2">
                    {profile.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#32f08c]" />
                        {profile.city}
                      </div>
                    )}
                    {profile.industry && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-[#32f08c]" />
                        {profile.industry}
                      </div>
                    )}
                    {profile.years_of_experience && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#32f08c]" />
                        {profile.years_of_experience} years exp.
                      </div>
                    )}
                  </div>
                </div>

                {/* PIN Display - Centered or subtle */}
                {pin && (
                  <div className="mt-6 inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-center">
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">Professional PIN</div>
                      <div className="text-xl font-mono font-bold text-white tracking-widest">{pin.pin_number}</div>
                    </div>
                    <Separator orientation="vertical" className="h-8 bg-white/10" />
                    <div className="text-center">
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">Trust Score</div>
                      <div className="text-xl font-bold text-[#32f08c]">{pin.trust_score}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-8">
                  <Separator className="mb-6 bg-white/10" />
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-white/90 leading-relaxed max-w-3xl">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements & Badges */}
          <Card className="bg-[#0e0f12]/80 border-[#1a1b1f]/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#32f08c]" />
                Achievements & Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                 <ContributionBadge type="streak" count={12} />
                 <ContributionBadge type="endorsement" count={8} />
                 <ContributionBadge type="upload" count={24} />
                 <ContributionBadge type="activity" count={150} />
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          {workExperiences.length > 0 && (
            <Card className="bg-[#0e0f12]/80 border-[#1a1b1f]/50">
              <CardContent className="p-0 sm:p-6">
                <div className="p-6 sm:p-0 mb-0 sm:mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#32f08c]" />
                    Work Experience
                  </h2>
                </div>
                <div className="px-2 sm:px-0 pb-6 sm:pb-0">
                  <WorkTimeline 
                    experiences={workExperiences} 
                    showProofBadges={true} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio & Case Studies Section */}
          {projects.length > 0 && (
            <Card className="bg-[#0e0f12]/80 border-[#1a1b1f]/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-[#32f08c]" />
                  Portfolio & Case Studies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="group cursor-pointer"
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-[#32f08c]/30 transition-all h-full">
                        <CardContent className="p-4">
                          {project.featured_image_url && (
                            <img
                              src={project.featured_image_url}
                              alt={project.title}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white group-hover:text-[#32f08c] transition line-clamp-1">
                              {project.title}
                            </h3>
                            {project.project_type === 'case_study' && (
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs border-0 shrink-0">
                                Case Study
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/70 line-clamp-2 mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(project.skills || []).slice(0, 3).map((skill: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-white/10 text-white/80 border-0">
                                {skill}
                              </Badge>
                            ))}
                            {(project.skills || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-white/10 text-white/60 border-0">
                                +{project.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Case Study Viewer Modal */}
          <CaseStudyViewer
            project={selectedProject}
            open={selectedProject !== null}
            onClose={() => setSelectedProject(null)}
          />

          <ContactModal
            open={showContactModal}
            onOpenChange={setShowContactModal}
            professionalId={profile?.user_id}
            professionalName={profile?.name || 'Professional'}
          />


          {/* Footer */}
          <div className="text-center text-sm text-white/60 py-6">
            <p>Powered by <span className="text-[#32f08c] font-semibold">GidiPIN</span></p>
            <p className="mt-2">Verified professional identity you can trust</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
