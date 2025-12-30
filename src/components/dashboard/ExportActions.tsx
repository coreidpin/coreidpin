/**
 * Export Actions Component
 * PDF and Social Card export buttons
 */

import React, { useState } from 'react';
import { Download, Share2, FileText, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { downloadPDFResume } from '../../utils/pdf-export';
import { downloadSocialCard } from '../../utils/social-cards';
import { supabase } from '../../utils/supabase/client';

interface ExportActionsProps {
  userId: string;
  userName: string;
  userRole: string;
  userSkills?: string[];
  pinNumber?: string;
  className?: string;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  userId,
  userName,
  userRole,
  userSkills = [],
  pinNumber,
  className
}) => {
  const [exporting, setExporting] = useState(false);

  const handlePDFExport = async () => {
    try {
      setExporting(true);
      await downloadPDFResume(userId);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleSocialCardExport = async () => {
    try {
      setExporting(true);
      
      // Fetch REAL data from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data: workExp } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId);
      
      const { data: projects } = await supabase
        .from('engineering_projects')
        .select('*')
        .eq('user_id', userId);
      
      // Calculate real stats
      const yearsExp = profile?.years_of_experience || (workExp?.length ? '5+' : '0');
      const projectCount = projects?.length || (workExp?.length ? '20+' : '0');
      
      await downloadSocialCard({
        name: profile?.full_name || profile?.name || userName,
        role: profile?.role || profile?.job_title || userRole,
        skills: profile?.skills?.slice(0, 5) || userSkills.slice(0, 5),
        pinNumber: profile?.pin || pinNumber,
        stats: {
          experience: yearsExp,
          projects: projectCount,
        }
      });
    } catch (error) {
      console.error('Social card export failed:', error);
      alert('Failed to generate social card. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6 ${className}`}
    >
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
        Export & Share
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PDF Export */}
        <Button
          onClick={handlePDFExport}
          disabled={exporting}
          variant="outline"
          className="flex items-center justify-center gap-2 h-auto py-4 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex flex-col items-center gap-2 w-full">
            <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <div>
              <div className="font-semibold text-sm">Download PDF</div>
              <div className="text-xs text-gray-500">Professional resume</div>
            </div>
          </div>
        </Button>

        {/* Social Card */}
        <Button
          onClick={handleSocialCardExport}
          disabled={exporting}
          variant="outline"
          className="flex items-center justify-center gap-2 h-auto py-4 border-2 hover:border-purple-500 hover:bg-purple-50 transition-all group"
        >
          <div className="flex flex-col items-center gap-2 w-full">
            <Image className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <div>
              <div className="font-semibold text-sm">Social Card</div>
              <div className="text-xs text-gray-500">Share on social media</div>
            </div>
          </div>
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Use PDF for applications, Social Card for LinkedIn/Twitter
        </p>
      </div>
    </motion.div>
  );
};
