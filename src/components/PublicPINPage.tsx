import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';

interface PublicPINPageProps {
  pinNumber: string;
  onNavigate?: () => void;
}

export default function PublicPINPage({ pinNumber }: PublicPINPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get user_id from PIN
        const { data: pinData, error: pinError } = await supabase
          .from('professional_pins')
          .select('user_id')
          .eq('pin_number', pinNumber)
          .single();

        if (pinError || !pinData) {
          setError('PIN not found');
          return;
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <Card className="border-2 border-blue-100">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                  {(profile.full_name || profile.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 break-words">
                    {profile.full_name || profile.name || 'Professional User'}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600">
                    {profile.role || profile.job_title || 'Professional'}
                  </p>
                  {profile.email_verified && (
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Professional PIN</div>
                <div className="text-base sm:text-xl font-mono font-bold text-blue-600 break-all">{pinNumber}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
              {profile.city && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.city}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile.created_at && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Member since {new Date(profile.created_at).getFullYear()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {profile.bio && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">About</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work Experience */}
        {profile.work_experience && profile.work_experience.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.work_experience.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-3 sm:gap-4 pb-4 border-b last:border-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900">{exp.title || exp.role}</h3>
                      <p className="text-sm sm:text-base text-gray-600 truncate">{exp.company}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{exp.duration || exp.timeline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Want your own Professional PIN?</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-blue-100">Join CoreID and get verified as a professional</p>
            <Button 
              onClick={() => navigate('/get-started')} 
              className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
            >
              Get Started
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
