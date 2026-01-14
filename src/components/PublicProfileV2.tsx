import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfileData } from '../hooks/useProfileData';
import { IdentitySidebar } from './profile-v2/IdentitySidebar';
import { ProfileFeed } from './profile-v2/ProfileFeed';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);

export const PublicProfileV2: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Phase 3: Real Data Integration
  const { profile, workExperiences, projects, skills, activityData, loading } = useProfileData(slug);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#c9d1d9]">
           Profile not found
        </div>
     );
  }

  // Map real data to UI format
  const mappedProfile = {
    name: profile.full_name || profile.profile_url_slug,
    username: profile.profile_url_slug,
    avatar_url: profile.avatar_url,
    bio: profile.bio || profile.headline,
    company: workExperiences?.[0]?.company_name || profile.company, // Fallback to profile company or latest job
    location: [profile.city, profile.country].filter(Boolean).join(', '),
    website: profile.website || profile.linkedin_url,
    email: profile.email, // Note: Privacy concern, might want to hide unless public
    followers: profile.followers_count || 0,
    following: profile.following_count || 0,
    isVerified: workExperiences?.some((e: any) => e.verification_status === 'verified')
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans flex flex-col">
       {/* Global Navigation Header Placeholder */}
       <header className="bg-[#010409] border-b border-[#30363d] py-4 px-6 sticky top-0 z-50">
          <div className="container mx-auto max-w-[1280px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl cursor-pointer" onClick={() => window.location.href='/'}>
                      G
                  </div>
                  <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-white">
                      <span>Product</span>
                      <span>Solutions</span>
                      <span>Open Source</span>
                  </nav>
              </div>
              <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                      <input 
                        type="text" 
                        placeholder="Search or jump to..." 
                        className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-sm text-[#c9d1d9] w-64 focus:ring-1 focus:ring-[#58a6ff] outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-[#8b949e]">/</span>
                  </div>
              </div>
          </div>
       </header>

      <div className="container mx-auto px-4 py-8 max-w-[1280px] flex-grow">
        
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar (25%) */}
          <div className="w-full lg:w-[296px] flex-shrink-0 relative">
             <div className="lg:sticky lg:top-24">
               <IdentitySidebar profile={mappedProfile} />
             </div>
          </div>

          {/* Right Content (Rest) */}
          <div className="flex-1 min-w-0">
             <ProfileFeed 
               username={mappedProfile.username} 
               bio={mappedProfile.bio}
               projects={projects}
               activityData={activityData}
               skills={skills}
               workExperiences={workExperiences}
             />
          </div>

        </div>
      </div>
    </div>
  );
};
