import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../utils/supabase/client';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
  Globe,
  Linkedin,
  Twitter,
  QrCode,
  Download,
  Share2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { WorkTimeline } from './portfolio/WorkTimeline';
import { BetaBadge } from './ui/BetaBadge';
import { TopTalentBadge } from './ui/TopTalentBadge';


interface PublicPINPageProps {
  pinNumber: string;
  onNavigate?: () => void;
}

export default function PublicPINPage({ pinNumber }: PublicPINPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

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
        {/* Hero Background */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white p-1 shadow-md">
                          {profile.profile_picture_url ? (
                            <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-4xl font-bold">
                              {(profile.full_name || profile.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {profile.email_verified && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Identity">
                            <Shield className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Name & Title */}
                      <div className="flex-1 min-w-0 pt-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {profile.full_name || profile.name || 'Professional User'}
                          </h1>
                          {profile.email_verified && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 h-6">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          )}
                          <BetaBadge className="h-6" />
                          <TopTalentBadge className="h-6" />
                        </div>
                        <p className="text-lg text-gray-600 font-medium mb-3">
                          {profile.role || profile.job_title || 'Professional'}
                        </p>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-8 text-sm text-gray-600 mt-4 items-center">
                          {profile.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{profile.city}</span>
                            </div>
                          )}
                          {profile.city && profile.industry && (
                            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                          )}
                          {profile.industry && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <span>{profile.industry}</span>
                            </div>
                          )}
                          {profile.industry && profile.years_of_experience && (
                            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                          )}
                          {profile.years_of_experience && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{profile.years_of_experience} Years Exp.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Me
                      </Button>
                      <Button variant="outline" onClick={() => setShowQR(true)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Share Profile
                      </Button>
                      {/* Social Links */}
                      <div className="flex items-center gap-2 ml-auto pl-2 border-l border-gray-200">
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#0077b5] hover:bg-blue-50 rounded-full transition-colors">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {profile.twitter && (
                          <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
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
              {profile.work_experience && profile.work_experience.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      Work Experience
                    </h2>
                    <WorkTimeline 
                      experiences={profile.work_experience.map((exp: any) => ({
                        id: exp.id || `${exp.company}-${exp.start_date}`,
                        job_title: exp.title || exp.role,
                        company_name: exp.company,
                        company_logo_url: exp.company_logo_url,
                        start_date: exp.start_date,
                        end_date: exp.end_date,
                        is_current: exp.current || false,
                        location: exp.location,
                        description: exp.description,
                        proof_documents: exp.proof_documents || []
                      }))}
                      showProofBadges={true}
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
    </>
  );
}

// Helper Icon
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

