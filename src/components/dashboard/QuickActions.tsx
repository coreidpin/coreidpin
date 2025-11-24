import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Fingerprint, Eye, Download, Phone, Share2, Settings, Plus, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onAddProject?: () => void;
  onRequestEndorsement?: () => void;
  reducedMotion?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAddProject, 
  onRequestEndorsement, 
  reducedMotion = false 
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
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <Plus className="h-6 w-6 text-black mb-1" />
                <span className="text-xs font-medium text-center leading-tight">Add Project</span>
              </Button>
            )}

            {onRequestEndorsement && (
              <Button 
                onClick={onRequestEndorsement}
                variant="outline" 
                className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
              >
                <UserPlus className="h-6 w-6 text-black mb-1" />
                <span className="text-xs font-medium text-center leading-tight">Request Endorsement</span>
              </Button>
            )}

            <Button 
              onClick={() => window.location.href = '/identity-management'}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Fingerprint className="h-6 w-6 text-purple-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Manage Identity</span>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/card'}
              variant="outline" 
              className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal"
            >
              <Eye className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">View Public Profile</span>
            </Button>
            
            <Button variant="outline" className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal">
              <Download className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Download Badge</span>
            </Button>
            
            <Button variant="outline" className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal">
              <Phone className="h-6 w-6 text-purple-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Update Phone</span>
            </Button>
            
            <Button variant="outline" className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal">
              <Share2 className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Share PIN</span>
            </Button>
            
            <Button variant="outline" className="h-auto min-h-[100px] p-4 flex-col justify-center gap-3 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all whitespace-normal">
              <Settings className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">Security Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
