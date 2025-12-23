import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Fingerprint, Eye, Download, Phone, Share2, Settings, Plus, UserPlus, FileText, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface QuickActionsProps {
  onAddProject?: () => void;
  onRequestEndorsement?: () => void;
  onAddCaseStudy?: () => void;
  onDownloadBadge?: () => void;
  reducedMotion?: boolean;
  onGenerateResume?: () => void;
  jobTitle?: string;
  userPin?: string;
  isVerified?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAddProject, 
  onRequestEndorsement,
  onAddCaseStudy,
  onDownloadBadge,
  onGenerateResume,
  reducedMotion = false,
  userPin,
  isVerified = false,
  jobTitle
}) => {
  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reducedMotion ? undefined : { delay: 0.4 }}
    >
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {onAddProject && (
              <Button 
                onClick={onAddProject}
                variant="outline" 
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <Plus className="h-6 w-6 text-black mb-1" />
                <span className="text-xs font-medium text-center leading-tight">Add Project</span>
              </Button>
            )}

            {onGenerateResume && (
              <Button 
                onClick={onGenerateResume}
                variant="outline" 
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <FileText className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                    Resume Builder
                    <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">NEW</span>
                </span>
              </Button>
            )}

            {onAddCaseStudy && (
              <Button 
                onClick={onAddCaseStudy}
                variant="outline" 
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <FileText className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">Create Case Study</span>
              </Button>
            )}

            {onRequestEndorsement && (
              <Button 
                onClick={onRequestEndorsement}
                variant="outline" 
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <UserPlus className="h-6 w-6 text-black mb-1" />
                <span className="text-xs font-medium text-center leading-tight">Request Endorsement</span>
              </Button>
            )}

            <Button 
              onClick={() => window.location.href = '/identity-management'}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Fingerprint className="h-6 w-6 text-purple-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Manage Identity</span>
            </Button>
            
            <Button 
              onClick={() => {
                if (userPin) {
                  window.location.href = `/pin/${userPin}`;
                } else {
                  window.location.href = '/card';
                }
              }}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Eye className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">View Public Profile</span>
            </Button>
            
            
            {/* Download Badge / Share Profile */}
            <Button 
              onClick={onDownloadBadge}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Download className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                Download Badge
                <span className="block text-[10px] text-gray-500 mt-0.5">Share Profile</span>
              </span>
            </Button>
            


            <div className="relative group w-full">
              <div className="absolute top-2 right-2 z-20 pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <div className="absolute top-0 right-3 bg-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded-full font-medium shadow-sm whitespace-nowrap">NEW</div>
              </div>
              <Button 
                onClick={() => window.location.href = '/referrals'}
                variant="outline" 
                className="w-full h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal relative overflow-hidden"
              >
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-xs font-medium text-center leading-tight">Invite & Earn</span>
              </Button>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/security'}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-0 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Settings className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Security Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
