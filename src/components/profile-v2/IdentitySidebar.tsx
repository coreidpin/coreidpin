import React from 'react';
import { MapPin, Link as LinkIcon, Mail, Building, Users, Shield } from 'lucide-react';

interface IdentitySidebarProps {
  profile?: {
    name: string;
    username: string;
    bio: string;
    avatar_url: string;
    company?: string;
    location?: string;
    website?: string;
    email?: string;
    followers?: number;
    following?: number;
    isVerified?: boolean;
  };
}

export const IdentitySidebar: React.FC<IdentitySidebarProps> = ({ profile }) => {
  // Default values or placeholders
  const name = profile?.name || 'User Name';
  const username = profile?.username || 'username';
  const bio = profile?.bio || 'Professional bio goes here.';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="space-y-4">
      {/* Avatar Section */}
      <div className="relative group">
        <div className="w-full aspect-square rounded-full overflow-hidden border border-[#30363d] bg-[#0d1117] shadow-sm">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full bg-[#21262d] flex items-center justify-center">
                <span className="text-4xl text-[#8b949e]">?</span>
             </div>
          )}
        </div>
        {/* Status Icon Placeholder (z-index layered) */}
        <div className="absolute bottom-[10%] right-[10%] w-8 h-8 bg-[#0d1117] rounded-full flex items-center justify-center border border-[#30363d] cursor-pointer transition-opacity z-10">
           <span className="text-base">💭</span>
        </div>
      </div>

      {/* Names */}
      <div className="py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[26px] font-bold text-white leading-[1.25]">{name}</h1>
          {profile?.isVerified && (
            <div className="flex items-center justify-center p-1 bg-[#238636]/10 rounded-full text-[#3fb950] border border-[#238636]/30" title="Verified Professional">
              <Shield className="w-4 h-4 fill-[#238636]/20" />
            </div>
          )}
        </div>
        <p className="text-[20px] text-[#8b949e] font-light leading-[1.25]">{username}</p>
      </div>

      {/* CTA Button */}
      <button className="w-full bg-[#21262d] text-[#c9d1d9] border border-[rgba(240,246,252,0.1)] hover:bg-[#30363d] hover:text-white px-4 py-1.5 rounded-md font-medium text-sm transition-all duration-200 shadow-sm">
        Follow
      </button>

      {/* Bio */}
      <div className="text-[16px] text-[#c9d1d9] leading-6">
        {bio}
      </div>

      {/* Stats - Followers */}
      <div className="flex items-center gap-1 text-sm text-[#8b949e] py-3">
        <Users className="w-4 h-4 text-[#8b949e]" />
        <span className="font-bold text-[#c9d1d9] hover:text-[#58a6ff] cursor-pointer">
          {profile?.followers ? (profile.followers / 1000).toFixed(1) + 'k' : 0}
        </span>
        <span className="hover:text-[#58a6ff] cursor-pointer">followers</span>
        <span>·</span>
        <span className="font-bold text-[#c9d1d9] hover:text-[#58a6ff] cursor-pointer">
          {profile?.following || 0}
        </span>
        <span className="hover:text-[#58a6ff] cursor-pointer">following</span>
      </div>

      {/* Metadata List */}
      <div className="flex flex-col gap-2 pt-2">
        {profile?.company && (
          <div className="flex items-start gap-2 text-sm text-[#c9d1d9]">
            <Building className="w-4 h-4 text-[#8b949e] mt-0.5 flex-shrink-0" />
            <span className="truncate">{profile.company}</span>
          </div>
        )}
        {profile?.location && (
          <div className="flex items-start gap-2 text-sm text-[#c9d1d9]">
            <MapPin className="w-4 h-4 text-[#8b949e] mt-0.5 flex-shrink-0" />
            <span className="truncate">{profile.location}</span>
          </div>
        )}
        {profile?.email && (
          <div className="flex items-start gap-2 text-sm text-[#c9d1d9]">
            <Mail className="w-4 h-4 text-[#8b949e] mt-0.5 flex-shrink-0" />
            <a href={`mailto:${profile.email}`} className="hover:text-[#58a6ff] hover:underline truncate">{profile.email}</a>
          </div>
        )}
        {profile?.website && (
          <div className="flex items-start gap-2 text-sm text-[#c9d1d9]">
            <LinkIcon className="w-4 h-4 text-[#8b949e] mt-0.5 flex-shrink-0" />
            <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-[#58a6ff] hover:underline truncate">{profile.website}</a>
          </div>
        )}
      </div>

      {/* Achievements / Badges Area */}
      <div className="pt-6 border-t border-[#30363d] mt-4">
        <h3 className="text-base font-semibold text-[#c9d1d9] mb-3">Achievements</h3>
        <div className="flex gap-2">
           <img 
             src="https://github.githubassets.com/assets/yolo-default-be0bbff04951.png" 
             alt="YOLO" 
             className="w-16 h-16 transition-transform hover:scale-110 cursor-pointer"
             onError={(e) => { e.currentTarget.style.display = 'none'; }}
           />
           <img 
             src="https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png" 
             alt="Pull Shark" 
             className="w-16 h-16 transition-transform hover:scale-110 cursor-pointer"
             onError={(e) => { e.currentTarget.style.display = 'none'; }}
           />
           <img 
             src="https://github.githubassets.com/assets/quickdraw-default-39c6aec8c9d7.png" 
             alt="Quickdraw" 
             className="w-16 h-16 transition-transform hover:scale-110 cursor-pointer"
             onError={(e) => { e.currentTarget.style.display = 'none'; }}
           />
        </div>
      </div>
    </div>
  );
};
