import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { getEndorsers } from '../../utils/endorsements-api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EndorsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
}

interface Endorser {
  endorser_id: string;
  profiles: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    role?: string;
    job_title?: string;
  };
}

export const EndorsersModal: React.FC<EndorsersModalProps> = ({ 
  isOpen, 
  onClose, 
  skillId,
  skillName
}) => {
  const [endorsers, setEndorsers] = useState<Endorser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && skillId) {
      loadEndorsers();
    }
  }, [isOpen, skillId]);

  const loadEndorsers = async () => {
    try {
      setLoading(true);
      const data = await getEndorsers(skillId);
      setEndorsers(data as any || []);
    } catch (error) {
      console.error('Failed to load endorsers:', error);
      toast.error('Failed to load endorsers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center pb-2">
            Endorsed {skillName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {loading ? (
             <div className="py-8 flex justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
             </div>
          ) : endorsers.length === 0 ? (
             <div className="py-8 text-center text-gray-500">
               No endorsements yet.
             </div>
          ) : (
             <div className="space-y-4">
               {endorsers.map((item) => {
                 const profile = item.profiles;
                 const name = profile.full_name || profile.name || 'Anonymous User';
                 
                 return (
                   <div key={item.endorser_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                     <div className="flex items-center gap-3">
                       <Avatar>
                         <AvatarImage src={profile.avatar_url} />
                         <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className="text-left">
                         <div className="font-semibold text-gray-900 text-sm">{name}</div>
                         {(profile.role || profile.job_title) && (
                           <div className="text-xs text-gray-500">{profile.role || profile.job_title}</div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
