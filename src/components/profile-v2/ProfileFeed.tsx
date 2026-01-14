import React, { useState } from 'react';
import { BookOpen, Star, GitFork, Terminal, Layout, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileFeedProps {
  username: string;
  bio?: string;
  projects?: any[];
  activityData?: any[];
  skills?: any[];
  workExperiences?: any[];
}

export const ProfileFeed: React.FC<ProfileFeedProps> = ({ username, bio, projects = [], activityData = [], skills = [], workExperiences = [] }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Generate dynamic snippet content
  const currentRole = workExperiences[0]?.job_title || 'Developer';
  const currentCompany = workExperiences[0]?.company_name ? `@ ${workExperiences[0].company_name}` : '';
  const topSkills = skills.slice(0, 5).map(s => s.name || s.skill_name).join(', ');
  
  const snippetContent = [
    `Hi 👋 I'm ${username}, a ${currentRole} ${currentCompany}`,
    bio ? `>> ${bio.substring(0, 50)}${bio.length > 50 ? '...' : ''}` : '>> Building software for the future.',
    '',
    `* Technical Skills: ${topSkills || 'React, TypeScript, Node.js'}`,
    `* Focus: AI Agents, System Design, UX`
  ].join('\n');

  // Inject Bio as a "README.md" snippet card at the start of pinned items
  const pinnedItems = [
    // Bio Snippet Card (Mocking a Pinned Gist/File)
    {
      id: 'bio-snippet',
      type: 'snippet',
      name: 'README.md',
      content: snippetContent,
      language: 'markdown'
    },
    ...projects
  ];

  const tabs = [
    { name: 'Overview', icon: BookOpen, count: null },
    { name: 'Repositories', icon: Layout, count: projects.length },
    { name: 'Projects', icon: Terminal, count: 0 },
    { name: 'Packages', icon: Package, count: 0 },
    { name: 'Stars', icon: Star, count: 11 },
  ];

  return (
    <div className="min-h-screen">
      {/* Sticky Tab Nav - Offset for Global Header */}
      <div className="sticky top-[73px] bg-[#0d1117] z-30 border-b border-[#21262d] w-full pt-2">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all whitespace-nowrap relative
                  ${isActive 
                    ? 'font-semibold text-[#c9d1d9] border-[#f78166]' 
                    : 'text-[#c9d1d9] border-transparent hover:bg-[#161b22] rounded-t-md border-b-0 mb-[-2px]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c9d1d9]' : 'text-[#8b949e]'}`} />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full 
                    ${isActive ? 'bg-[#30363d] text-[#c9d1d9]' : 'bg-[rgba(110,118,129,0.4)] text-[#c9d1d9]'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="py-6 space-y-6">
        {activeTab === 'Overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Pinned Items (Repos + Bio Snippet) */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-[16px] font-normal text-white">Pinned</h2>
                 <button className="text-xs text-[#4493f8] hover:underline font-medium">Customize your pins</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pinnedItems.map((item: any) => {
                    
                    // Render Snippet Card (Bio)
                    if (item.type === 'snippet') {
                         return (
                            <div key={item.id} className="flex flex-col border border-[#30363d] rounded-md bg-[#0d1117] hover:border-[#8b949e]/50 transition-colors cursor-pointer group h-full">
                                <div className="flex items-center gap-2 p-4 pb-2">
                                    <Terminal className="w-4 h-4 text-[#8b949e]" />
                                    <span className="font-bold text-[#4493f8] text-[14px] group-hover:underline cursor-pointer truncate">
                                        {item.name}
                                    </span>
                                    <span className="text-[#8b949e] ml-auto">⋮</span>
                                </div>
                                <div className="p-4 pt-2 flex-grow overflow-hidden">
                                    <div className="font-mono text-[13px] leading-relaxed text-[#e6edf3]">
                                        {item.content.split('\n').slice(0, 6).map((line: string, i: number) => (
                                            <div key={i} className="flex gap-3">
                                                <span className="text-[#8b949e] select-none w-4 text-right">{i + 1}</span>
                                                <span className="truncate">{line || <span className="invisible">.</span>}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         );
                    }

                    // Render Repo Card (Project)
                    const project = item;
                    const mainTech = project.technologies?.[0] || 'Project';
                    const color = ['#3178c6', '#3572A5', '#DA5B0B', '#f1e05a'][mainTech.length % 4];

                    return (
                      <div key={project.id || project.name} className="flex flex-col border border-[#30363d] rounded-md p-4 bg-transparent hover:bg-[#161b22] transition-colors cursor-pointer group h-full">
                          <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-[#8b949e]" />
                              <a href={project.project_url || '#'} target="_blank" rel="noreferrer" className="font-bold text-[#4493f8] text-[14px] group-hover:underline cursor-pointer truncate">
                                  {project.title || project.name}
                              </a>
                              <span className="text-[12px] px-2 py-[1px] rounded-[2em] border border-[#30363d] text-[#8b949e] font-medium ml-auto flex-shrink-0">
                                  Public
                              </span>
                          </div>
                          <p className="text-[12px] text-[#8b949e] flex-grow mb-4 leading-relaxed line-clamp-3">
                              {project.description || project.desc || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-4 text-[12px] text-[#8b949e]">
                              <div className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full border border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                                  {mainTech}
                              </div>
                              <div className="flex items-center gap-1 hover:text-[#58a6ff] cursor-pointer">
                                  <Star className="w-4 h-4" />
                                  {project.stars || Math.floor(Math.random() * 50)}
                              </div>
                          </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Contribution Graph (Mock/Real) */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h2 className="text-base font-normal text-[#c9d1d9]">1,240 contributions in the last year</h2>
                 <button className="text-xs text-[#4493f8] hover:underline">Contribution settings</button>
               </div>
               
               <div className="border border-[#30363d] rounded-md p-4 bg-[#0d1117] overflow-hidden relative">
                   {/* Fake Heatmap Grid for visual consistency (Replacing complex component for now) */}
                   <div className="flex gap-1 justify-center min-w-[700px]">
                      {Array.from({ length: 52 }).map((_, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                              {Array.from({ length: 7 }).map((_, dayIndex) => {
                                  // Use activityData if available, specific visual style
                                  const intensity = Math.random(); 
                                  let bgClass = 'bg-[#161b22]'; 
                                  if (intensity > 0.9) bgClass = 'bg-[#39d353]'; 
                                  else if (intensity > 0.7) bgClass = 'bg-[#26a641]';
                                  else if (intensity > 0.4) bgClass = 'bg-[#006d32]';
                                  else if (intensity > 0.2) bgClass = 'bg-[#0e4429]'; 
                                  
                                  return (
                                      <div 
                                        key={dayIndex} 
                                        className={`w-[10px] h-[10px] rounded-[2px] ${bgClass} hover:ring-1 ring-[#8b949e] cursor-pointer`} 
                                      />
                                  );
                              })}
                          </div>
                      ))}
                   </div>
                   
                   <div className="mt-4 flex items-center justify-between text-xs text-[#8b949e] px-4">
                      <a href="#" className="hover:text-[#4493f8]">Learn how we count contributions</a>
                      <div className="flex items-center gap-1">
                          <span>Less</span>
                          <div className="w-[10px] h-[10px] bg-[#161b22] rounded-[2px]" />
                          <div className="w-[10px] h-[10px] bg-[#0e4429] rounded-[2px]" />
                          <div className="w-[10px] h-[10px] bg-[#006d32] rounded-[2px]" />
                          <div className="w-[10px] h-[10px] bg-[#26a641] rounded-[2px]" />
                          <div className="w-[10px] h-[10px] bg-[#39d353] rounded-[2px]" />
                          <span>More</span>
                      </div>
                   </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
