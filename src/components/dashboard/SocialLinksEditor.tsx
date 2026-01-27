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
        <Label className="text-base text-gray-900 font-bold">Social Profiles</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAdding(true)}
          className="h-9 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-xl"
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
                className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 group transition-all"
              >
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-blue-600 shadow-sm">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 capitalize">{link.platform}</p>
                  <p className="text-xs text-slate-500 truncate">{link.url}</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(index)}
                  className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Platform</Label>
                <Select value={newPlatform} onValueChange={setNewPlatform}>
                  <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-xl">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent 
                    className="border border-slate-200 text-slate-900 bg-white shadow-xl max-h-[200px] rounded-xl"
                  >
                    {PLATFORMS.map(p => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="focus:bg-slate-50 cursor-pointer py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <p.icon className="h-4 w-4 text-blue-500" />
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Profile URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="flex-1 bg-white border-slate-200 h-11 rounded-xl text-slate-900"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-lg text-slate-600">Cancel</Button>
              <Button type="button" size="sm" onClick={handleAdd} className="bg-black text-white hover:bg-slate-800 rounded-lg h-9 px-5">
                Add Profile
              </Button>
            </div>
          </motion.div>
        )}

        {!isAdding && safeLinks.length === 0 && (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            No social profiles added yet.
          </div>
        )}
      </div>
    </div>
  );
};
