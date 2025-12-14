import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Building2, Shield, Briefcase, CheckCircle2, ChevronDown, ChevronUp, Award, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { CompanyLogo } from '../shared/CompanyLogo';
import type { ProofDocument } from '../dashboard/ProofDocumentUpload';
import type { EmploymentType } from '../../utils/employmentTypes';
import { EMPLOYMENT_TYPE_LABELS } from '../../utils/employmentTypes';

export interface WorkExperience {
  id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  start_date: string; // ISO date or month format
  end_date?: string;
  is_current: boolean;
  location?: string;
  employment_type?: EmploymentType; // 🆕 NEW: Full-time, Part-time, etc.
  description?: string;
  skills?: string[]; // 🆕 NEW: Array of skills used in this role
  achievements?: string[]; // 🆕 NEW: Array of key achievements
  verification_status?: string | boolean;
  proof_documents?: ProofDocument[];
}

interface WorkTimelineProps {
  experiences: WorkExperience[];
  showProofBadges?: boolean;
}

export function WorkTimeline({ experiences = [], showProofBadges = true }: WorkTimelineProps) {
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  const toggleSkills = (expId: string) => {
    setExpandedSkills(prev => ({ ...prev, [expId]: !prev[expId] }));
  };

  if (experiences.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No work experience added yet</p>
        </CardContent>
      </Card>
    );
  }

  // Sort experiences by start date (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    return dateB - dateA; // Descending order
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate duration in months
  const calculateDuration = (start: string, end?: string, isCurrent?: boolean) => {
    const startDate = new Date(start);
    const endDate = isCurrent ? new Date() : new Date(end || start);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    if (months < 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years}y ${remainingMonths}m`;
  };

  // Get company initials for logo fallback
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group by year
  const groupedByYear: { [year: string]: WorkExperience[] } = {};
  sortedExperiences.forEach(exp => {
    const year = new Date(exp.start_date).getFullYear().toString();
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(exp);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-300" />

      <div className="space-y-8">
        {years.map((year, yearIndex) => (
          <div key={year} className="relative">
            {/* Year Marker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yearIndex * 0.1 }}
              className="sticky top-4 z-10 mb-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{year}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
            </motion.div>

            {/* Experience Cards for this year */}
            <div className="space-y-6 ml-14 md:ml-24">
              {groupedByYear[year].map((exp, expIndex) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (yearIndex * 0.1) + (expIndex * 0.05) }}
                  className="relative"
                >
                  {/* Connection Dot */}
                  <div className="absolute -left-20 top-6">
                    <div className={`w-4 h-4 rounded-full border-4 ${
                      exp.is_current 
                        ? 'bg-green-500 border-green-200 shadow-lg shadow-green-500/50 animate-pulse' 
                        : 'bg-white border-blue-500'
                    }`} />
                  </div>

                  {/* Experience Card */}
                  <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl border ${ 
                    exp.is_current 
                      ? 'border-green-500/50 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 shadow-lg shadow-green-500/10' 
                      : 'border-gray-200/60 bg-white hover:border-gray-300 shadow-md'
                  }`}>
                    <CardContent className="p-5 md:p-7">
                      <div className="flex items-start gap-4 md:gap-6">
                        {/* Company Logo - Auto-fetched from shared database */}
                        <div className="flex-shrink-0">
                          <CompanyLogo 
                            companyName={exp.company_name}
                            size="lg"
                            showTooltip={false}
                            className="w-14 h-14 md:w-20 md:h-20"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-3.5">
                          
                          {/* 1. Job Title & Badge (Side-by-Side) - Clean minimal */}
                          <div className="flex items-baseline gap-3">
                             <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">
                               {exp.job_title}
                             </h3>
                             {exp.is_current && (
                               <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex-shrink-0 translate-y-[-1px] flex items-center gap-1.5">
                                 <span className="relative flex h-2 w-2">
                                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                   <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                 </span>
                                 Current
                               </Badge>
                             )}
                          </div>

                          {/* 2. Company Name & Employment Type */}
                          <div className="flex items-center gap-2 -mt-0.5 flex-wrap">
                             <span className="text-base md:text-lg font-semibold text-gray-700">
                               {exp.company_name}
                             </span>
                             {exp.employment_type && (
                               <>
                                 <span className="text-gray-400">·</span>
                                 <span className="text-sm md:text-base text-gray-600">
                                   {EMPLOYMENT_TYPE_LABELS[exp.employment_type]}
                                 </span>
                               </>
                             )}
                          </div>

                          {/* 3. Date & Duration */}
                          <div className="flex flex-nowrap items-center gap-x-2 text-xs md:text-sm text-gray-500 overflow-hidden">
                            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                              <span className="truncate">
                                {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date!)}
                              </span>
                              <span className="text-gray-400 flex-shrink-0">
                                ({calculateDuration(exp.start_date, exp.end_date, exp.is_current)})
                              </span>
                            </div>

                            {exp.location && (
                               <div className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex">
                                 <span className="text-gray-300">|</span>
                                 <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                 <span className="truncate">{exp.location}</span>
                               </div>
                            )}
                            </div>

                            {/* Verified Employee Badge */}
                            {(exp.verification_status === 'verified' || exp.verification_status === true) && (
                               <div className="pt-2">
                                 <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1 pl-1 pr-2.5 py-1 w-fit">
                                    <div className="bg-green-500 rounded-full p-0.5">
                                      <CheckCircle2 className="h-3 w-3 text-white" />
                                    </div>
                                    Verified Employee
                                 </Badge>
                               </div>
                            )}

                          {/* Proof Badges */}
                           {showProofBadges && exp.proof_documents && exp.proof_documents.length > 0 && (
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-green-600 font-medium text-sm">
                                  {exp.proof_documents.length} proof{exp.proof_documents.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                          {/* 4. Description */}
                          {exp.description && (
                            <p className="text-gray-700 text-sm leading-relaxed pt-1">
                              {exp.description}
                            </p>
                          )}

                          {/* 🆕 5. Key Achievements */}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                <h4 className="text-sm font-semibold text-gray-900">Key Achievements</h4>
                              </div>
                              <ul className="space-y-1.5 ml-6">
                                {exp.achievements.map((achievement, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 leading-relaxed list-disc">
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 🆕 6. Skills Section - LinkedIn-style Expandable */}
                          {exp.skills && exp.skills.length > 0 && (
                            <div className="pt-3">
                              <button
                                onClick={() => toggleSkills(exp.id)}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors group w-full"
                              >
                                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <span>
                                  {exp.skills.length} skill{exp.skills.length !== 1 ? 's' : ''}
                                </span>
                                {expandedSkills[exp.id] ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                                )}
                              </button>

                              <AnimatePresence>
                                {expandedSkills[exp.id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                                      {exp.skills.map((skill, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-3 py-1 text-xs font-medium"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* 5. Progress Bar */}
                          <div className="pt-3">
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '100%' }}
                                className={`h-full rounded-full ${
                                  exp.is_current 
                                    ? 'bg-green-600' 
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                }`}
                                />
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
