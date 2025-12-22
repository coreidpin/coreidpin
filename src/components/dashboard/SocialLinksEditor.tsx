import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Linkedin, Twitter, Github, Instagram, Globe, Facebook, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'twitter', label: 'Twitter / X', icon: Twitter },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'website', label: 'Personal Website', icon: Globe },
  { id: 'other', label: 'Other', icon: Globe },
];

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ links, onChange }) => {
  // Ensure links is always an array to prevent crashes
  const safeLinks = links || [];
  
  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState('linkedin');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (!newUrl) return;
    
    // Auto-fix URL if missing protocol
    let url = newUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const newLink: SocialLink = {
      platform: newPlatform,
      url
    };

    onChange([...safeLinks, newLink]);
    setNewUrl('');
    setIsAdding(false);
  };

  const handleRemove = (index: number) => {
    const updated = [...safeLinks];
    updated.splice(index, 1);
    onChange(updated);
  };

  const getIcon = (platformId: string) => {
    const p = PLATFORMS.find(p => p.id === platformId);
    return p ? p.icon : Globe;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base text-white">Social Profiles</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAdding(true)}
          className="h-8 border-dashed border-white/20 hover:border-[#32f08c] hover:text-[#32f08c]"
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {safeLinks.map((link, index) => {
            const Icon = getIcon(link.platform);
            return (
              <motion.div
                key={`${link.platform}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 group"
              >
                <div className="bg-white/10 p-2 rounded-md text-white/70">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white capitalize">{link.platform}</p>
                  <p className="text-xs text-white/50 truncate">{link.url}</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg border border-[#32f08c]/50 bg-[#32f08c]/5 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/70">Platform</Label>
                <Select value={newPlatform} onValueChange={setNewPlatform}>
                  <SelectTrigger className="w-full h-10 bg-[#0a0b0d] border-white/10 text-white focus:ring-[#32f08c]">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent 
                    className="border border-white/20 text-white z-[99999] shadow-2xl max-h-[200px]"
                    position="item-aligned"
                    style={{ backgroundColor: '#000000', opacity: 1 }}
                  >
                    {PLATFORMS.map(p => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="text-white focus:bg-white/10 focus:text-white cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-2">
                          <p.icon className="h-4 w-4" />
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs">Profile URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-[#0a0b0d] border-white/10"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="button" size="sm" onClick={handleAdd} className="bg-[#32f08c] text-black hover:bg-[#32f08c]/90">
                Add Link
              </Button>
            </div>
          </motion.div>
        )}

        {!isAdding && safeLinks.length === 0 && (
          <div className="text-center py-6 border border-dashed border-white/10 rounded-lg text-white/40 text-sm">
            No social profiles added yet.
          </div>
        )}
      </div>
    </div>
  );
};
