import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Quote, Check, X, Trash2 } from 'lucide-react';
import { Endorsement } from '../../types/dashboard';

interface EndorsementCardProps {
  endorsement: Endorsement;
  index: number;
  onRespond: (endorsementId: string, status: 'accepted' | 'rejected') => void;
  onDelete: (endorsementId: string) => void;
}

// Inline minimal check-circle icon for repeated usage
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement, index, onRespond, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Quote className="h-16 w-16 text-gray-900 transform rotate-180" />
        </div>
        
        <CardContent className="p-6 flex flex-col h-full relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 border-2 border-white shadow-sm">
                {(endorsement.endorserName || '?').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{endorsement.endorserName || 'Unknown'}</h3>
                <p className="text-xs text-gray-500 font-medium">{endorsement.role}</p>
                <p className="text-xs text-gray-400">{endorsement.company}</p>
              </div>
            </div>
            {endorsement.status === 'accepted' && (
              <Badge className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {endorsement.status === 'pending' && (
              <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100">
                Pending
              </Badge>
            )}
          </div>
          
          <div className="mb-6 flex-grow">
            <p className="text-gray-700 italic leading-relaxed">"{endorsement.text}"</p>
          </div>
          
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">{new Date(endorsement.date).toLocaleDateString()}</span>
            
            <div className="flex gap-2">
              {endorsement.status === 'pending' ? (
                <>
                  <Button 
                    size="sm" 
                    className="bg-black hover:bg-gray-800 text-white h-8 px-3"
                    onClick={() => onRespond(endorsement.id, 'accepted')}
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-200 text-red-600 hover:bg-red-50 h-8 px-3"
                    onClick={() => onRespond(endorsement.id, 'rejected')}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reject
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(endorsement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
