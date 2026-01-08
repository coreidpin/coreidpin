import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../utils/supabase/client';
import { getProfileAvatar } from '../utils/avatarUtils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CompanyLogo } from './shared/CompanyLogo';
import { 
  Shield, 
  Briefcase, 
  MapPin, 
  Mail, 
  Calendar,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Award,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  QrCode,
  Download,
  Share2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { WorkTimeline } from './portfolio/WorkTimeline';
import { BetaBadge } from './ui/BetaBadge';
import { TopTalentBadge } from './ui/TopTalentBadge';
import { ActivityTracker } from '../utils/activityTracker';
import { trackProfileView } from '../utils/demandAnalytics';
import type { AvailabilityStatus, WorkPreference } from '../types/availability';
import { ContactModal } from './public/ContactModal';
import { AVAILABILITY_LABELS, WORK_PREFERENCE_LABELS } from '../types/availability';
import { FeaturedSection, TechStackManager, CaseStudyList } from './portfolio';


interface PublicPINPageProps {
  pinNumber: string;
  onNavigate?: () => void;
}

export default function PublicPINPage({ pinNumber }: PublicPINPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get user_id from PIN
        const { data: pinData, error: pinError } = await (supabase
          .from('professional_pins') as any)
          .select('user_id')
          .eq('pin_number', pinNumber)
          .single();

        if (pinError || !pinData) {
          setError('PIN not found');
          return;
        }

        // Get profile data
        const { data: profileData, error: profileError } = await (supabase
          .from('profiles')
          .select('*') as any)
          .eq('user_id', pinData.user_id)
          .single();

        if (profileError || !profileData) {
          setError('Profile not found');
          return;
        }

        setProfile(profileData);
        
        // Track profile view for demand scoring
        if (profileData.user_id) {
          trackProfileView(profileData.user_id, 'anonymous');

          // Fetch work experiences from table (source of truth for verification)
          const { data: experiences } = await supabase
            .from('work_experiences')
            .select('*')
            .eq('user_id', profileData.user_id)
            .order('start_date', { ascending: false });
          
          if (experiences) {
            setWorkExperiences(experiences);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (pinNumber) {
      fetchProfile();
    }
  }, [pinNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Not Found</h2>
            <p className="text-gray-600">{error || 'The PIN you entered does not exist or is invalid.'}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{profile.full_name || profile.name || 'Professional'} - GidiPIN Profile</title>
        <meta name="description" content={`View ${profile.full_name || profile.name || 'Professional'}'s verified professional profile. ${profile.role || profile.job_title || 'Professional'} ${profile.city ? `based in ${profile.city}` : ''}`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Cover Image Section */}
                  <div className="relative h-32 sm:h-48 md:h-56 w-full overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                    {profile.cover_image ? (
                      <img 
                        src={profile.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500" />
                    )}
                  </div>

                  {/* Profile Content - Avatar overlaps cover */}
                  <div className="relative px-4 sm:px-10 pb-6">
                    <div className="flex flex-col items-center gap-4">
                      {/* Avatar - Overlapping cover */}
                      <div className="relative -mt-12 sm:-mt-16">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                          <img 
                            src={getProfileAvatar(profile)} 
                            alt={profile.full_name || profile.name || 'Profile'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl sm:text-5xl font-bold">
                                    ${(profile.full_name || profile.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Name & Title - Compact mobile */}
                      <div className="flex-1 min-w-0 pt-1 sm:pt-2 text-center">
                        <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                          {profile.full_name || profile.name || 'Professional User'}
                        </h1>
                        
                        {/* Horizontal Scrolling Badge Carousel - Compact mobile */}
                        <div className="relative mb-2 sm:mb-4">
                          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 sm:pb-2">
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 min-w-max px-1">
                              {profile.email_verified && (
                                <Badge variant="secondary" className="snap-start bg-blue-50 text-blue-700 border-blue-100 text-[10px] sm:text-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full flex-shrink-0">
                                  <CheckCircle2 className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" /> Verified
                                </Badge>
                              )}
                              <div className="snap-start flex-shrink-0 text-[10px] sm:text-sm">
                                <BetaBadge />
                              </div>
                              <div className="snap-start flex-shrink-0 text-[10px] sm:text-sm">
                                <TopTalentBadge />
                              </div>
                            </div>
                          </div>
                          {/* Scroll indicator gradient - mobile only */}
                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden"></div>
                        </div>
                        
                        {/* Professional Title with Company Logo & CoreIDPin Logo Badge */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2 sm:mb-4">
                          <div className="flex items-center gap-2">
                            <p className="text-base sm:text-xl text-gray-600 font-medium">
                              {profile.role || profile.job_title || 'Professional'}
                            </p>
                          </div>
                          {/* CoreIDPin Logo Badge - LinkedIn style */}
                          <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <img 
                              src="/logos/gidipin-logo-color.svg" 
                              alt="CoreIDPin" 
                              className="h-3 w-auto sm:h-4"
                            />
                          </div>
                        </div>

                        {/* Availability Status Banner - Simple & Clean */}
                        {profile.availability_status && (
                          <div className="w-full max-w-2xl mx-auto mb-4 bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                              {/* Simple colored dot indicator */}
                              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                                profile.availability_status === 'actively_working' ? 'bg-blue-500' :
                                profile.availability_status === 'open_to_work_fulltime' ? 'bg-green-500' :
                                profile.availability_status === 'open_to_contract' ? 'bg-purple-500' :
                                'bg-gray-400'
                              }`}></div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-medium text-sm sm:text-base">
                                  {AVAILABILITY_LABELS[profile.availability_status as AvailabilityStatus]}
                                  {profile.work_preference && (
                                    <span className="text-gray-900 font-normal">
                                      {' • '}
                                      {WORK_PREFERENCE_LABELS[profile.work_preference as WorkPreference]}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Horizontal Scrolling Info Chips - Compact mobile */}
                        <div className="relative mt-3 sm:mt-5">
                          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                            <div className="flex gap-2 sm:gap-3 min-w-max px-1 pb-1 justify-center">
                              {profile.city && (
                                <div className="snap-start flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-200 text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="whitespace-nowrap font-normal">{profile.city}</span>
                                </div>
                              )}
                              {profile.industry && (
                                <div className="snap-start flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-200 text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="whitespace-nowrap font-normal">{profile.industry}</span>
                                </div>
                              )}
                              {profile.years_of_experience && (
                                <div className="snap-start flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-200 text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="whitespace-nowrap font-normal">{profile.years_of_experience} Years Exp.</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Scroll indicator - mobile only */}
                          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden"></div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links - Visible on all devices */}
                    {profile.social_links && profile.social_links.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 mt-6 justify-center sm:justify-start">
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
                              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 border border-gray-100 hover:border-blue-100 bg-white"
                              title={link.platform}
                            >
                              <Icon className="h-5 w-5" />
                            </a>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Desktop Action Buttons - Inside card */}
                    <div className="hidden sm:flex items-center gap-4 mt-8">
                      <Button 
                        onClick={() => setShowContactModal(true)}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl h-14 px-10 text-base font-semibold hover:scale-105 transition-transform"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        Contact Me
                      </Button>
                      
                      {profile.booking_url && (
                        <Button 
                          onClick={async () => {
                            // 1. Track Notification (Intent)
                            try {
                              if (profile.user_id) {
                                await supabase.from('notifications').insert({
                                  user_id: profile.user_id,
                                  type: 'info',
                                  category: 'notification',
                                  title: 'Booking Link Clicked',
                                  message: 'A visitor clicked your "Book Call" button. Check your calendar for potential confirmations.',
                                  metadata: { 
                                    action: 'booking_intent',
                                    source: 'public_profile',
                                    timestamp: new Date().toISOString()
                                  },
                                  is_read: false,
                                  is_new: true
                                });
                              }
                            } catch (err) {
                              console.error('Failed to log booking click:', err);
                            }

                            // 2. Open URL
                            window.open(profile.booking_url, '_blank');
                          }}
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 rounded-xl h-14 px-10 text-base font-semibold hover:scale-105 transition-transform"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Call
                        </Button>
                      )}

                      <Button variant="outline" onClick={() => setShowQR(true)} className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 rounded-xl h-14 px-10 text-base font-semibold hover:scale-105 transition-transform">
                        <QrCode className="h-5 w-5 mr-2" />
                        Share Profile
                      </Button>
                    </div>
                    
                    {/* Floating Action Bar - Mobile (hidden on desktop, buttons moved to bottom) */}
                    <div className="sm:hidden h-24"></div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              {profile.bio && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      About
                    </h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience Section */}
              {((workExperiences && workExperiences.length > 0) || (profile.work_experience && profile.work_experience.length > 0)) && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-0 sm:p-6">
                    <div className="p-4 sm:p-0 mb-0 sm:mb-6">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Work Experience
                      </h2>
                    </div>
                    <div className="px-2 sm:px-0 pb-4 sm:pb-0">
                      <WorkTimeline 
                        experiences={workExperiences.length > 0 ? workExperiences.map((exp: any) => ({
                          id: exp.id,
                          job_title: exp.job_title,
                          company_name: exp.company_name,
                          company_logo_url: exp.company_logo_url,
                          start_date: exp.start_date,
                          end_date: exp.end_date,
                          is_current: exp.is_current || false,
                          location: exp.location,
                          description: exp.description,
                          employment_type: exp.employment_type,
                          skills: exp.skills || [],
                          achievements: exp.achievements || [],
                          verification_status: exp.verification_status,
                          verification_source: exp.verification_source,
                          proof_documents: exp.proof_documents || []
                        })) : profile.work_experience.map((exp: any) => ({
                          id: exp.id || `${exp.company}-${exp.start_date}`,
                          job_title: exp.title || exp.role,
                          company_name: exp.company,
                          company_logo_url: exp.company_logo_url,
                          start_date: exp.start_date,
                          end_date: exp.end_date,
                          is_current: exp.current || false,
                          location: exp.location,
                          description: exp.description,
                          employment_type: exp.employment_type,
                          skills: exp.skills || [],
                          achievements: exp.achievements || [],
                          verification_status: exp.verification_status,
                          verification_source: exp.verification_source,
                          proof_documents: exp.proof_documents || []
                        }))}
                        showProofBadges={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ✨ Featured Section - Read Only */}
              {profile?.user_id && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <FeaturedSection
                      userId={profile.user_id}
                      editable={false}
                    />
                  </CardContent>
                </Card>
              )}

              {/* ✨ Tech Stack - Read Only */}
              {profile?.user_id && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <TechStackManager
                      userId={profile.user_id}
                      editable={false}
                    />
                  </CardContent>
                </Card>
              )}

              {/* ✨ Case Studies - Read Only */}
              {profile?.user_id && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <CaseStudyList
                      userId={profile.user_id}
                      editable={false}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Sidebar Info */}
            <div className="space-y-6">
              
              {/* PIN Card - Fixed Visibility */}
              <Card className="border-none shadow-sm bg-white overflow-hidden relative border border-gray-100">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Shield className="h-24 w-24 text-blue-600" />
                </div>
                <CardContent className="p-6">
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Professional PIN</div>
                  <div className="text-2xl font-mono font-bold text-blue-600 tracking-wide mb-4">{pinNumber}</div>
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Identity Verified by GidiPIN</span>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Certifications
                    </h2>
                    <div className="space-y-4">
                      {profile.certifications.map((cert: any, index: number) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="mt-1">
                            <Award className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{cert.name}</div>
                            <div className="text-xs text-gray-500">{cert.issuer} • {cert.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-2">Get Your Own PIN</h3>
                <p className="text-sm text-gray-600 mb-4">Join thousands of professionals verifying their identity.</p>
                <Button 
                  onClick={() => navigate('/get-started')} 
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 border-blue-200"
                >
                  Get Started
                </Button>
              </div>

            </div>
          </div>
        </div>
        
        {/* Floating Action Bar - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg sm:hidden z-50">
          <div className="max-w-lg mx-auto flex gap-3 overflow-x-auto scrollbar-hide py-1">
            <Button 
              onClick={() => setShowContactModal(true)} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 rounded-xl h-12 text-base font-semibold min-w-[140px]"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact
            </Button>
            
            {profile.booking_url && (
              <Button 
                onClick={() => window.open(profile.booking_url, '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 rounded-xl h-12 text-base font-semibold min-w-[140px]"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book
              </Button>
            )}

            <Button variant="outline" onClick={() => setShowQR(true)} className="flex-1 border-gray-300 rounded-xl h-12 text-base font-semibold min-w-[100px]">
              <QrCode className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Share Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`} 
                alt="Profile QR Code" 
                className="w-48 h-48"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-900">Scan to view profile</p>
              <p className="text-xs text-gray-500 break-all">{profileUrl}</p>
            </div>
            <Button className="w-full" onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              // You might want to add a toast here
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        professionalId={profile?.user_id}
        professionalName={profile?.full_name || profile?.name || 'Professional'}
      />
    </>
  );
}

// Helper Icon
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

