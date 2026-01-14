import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Pin, Briefcase, FolderGit2, GripVertical, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { getPinnedItems, reorderPinnedItems, toggleItemPin } from '../../lib/api/github-profile-features';

// Interface for unified pinnable items
interface PinnableItem {
  id: string;
  type: 'project' | 'work';
  title: string;
  subtitle: string;
  is_pinned: boolean;
  pin_order: number;
}

export const PinnedItemsManager: React.FC = () => {
  const [items, setItems] = useState<PinnableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedCount, setPinnedCount] = useState(0);
  const MAX_PINS = 6;

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Projects
      const { data: projects } = await supabase
        .from('professional_projects')
        .select('id, title, role, is_pinned, pin_order')
        .eq('user_id', user.id);

      // Fetch Work Experience
      const { data: work } = await supabase
        .from('work_experiences')
        .select('id, company, job_title, is_pinned, pin_order')
        .eq('user_id', user.id);

      // Normalize data
      const normalizedProjects: PinnableItem[] = (projects || []).map(p => ({
        id: p.id,
        type: 'project',
        title: p.title,
        subtitle: p.role || 'Project',
        is_pinned: p.is_pinned || false,
        pin_order: p.pin_order || 0
      }));

      const normalizedWork: PinnableItem[] = (work || []).map(w => ({
        id: w.id,
        type: 'work',
        title: w.job_title,
        subtitle: w.company,
        is_pinned: w.is_pinned || false,
        pin_order: w.pin_order || 0
      }));

      const allItems = [...normalizedProjects, ...normalizedWork];
      
      // Sort: Pinned first (by order), then unpinned
      allItems.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        if (a.is_pinned && b.is_pinned) return a.pin_order - b.pin_order;
        return 0;
      });

      setItems(allItems);
      setPinnedCount(allItems.filter(i => i.is_pinned).length);

    } catch (error) {
      console.error('Error loading pinnable items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (item: PinnableItem) => {
    if (!item.is_pinned && pinnedCount >= MAX_PINS) {
      toast.error(`You can only pin up to ${MAX_PINS} items.`);
      return;
    }

    // Optimistic update
    const newStatus = !item.is_pinned;
    const originalItems = [...items];
    
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, is_pinned: newStatus } : i
    ));
    setPinnedCount(prev => newStatus ? prev + 1 : prev - 1);

    try {
      const success = await toggleItemPin(item.id, item.type, newStatus);
      if (!success) throw new Error('Failed to update pin');
      
      // If pinning, could update order here
      if (newStatus) {
        toast.success(`Pinned "${item.title}"`);
      } else {
        toast.info(`Unpinned "${item.title}"`);
      }
    } catch (error) {
      setItems(originalItems); // Revert
      setPinnedCount(prev => newStatus ? prev - 1 : prev + 1);
      toast.error('Failed to update pin status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your work history...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pin className="w-5 h-5 text-gray-900" />
                Customize Pinned Items
              </CardTitle>
              <CardDescription>
                Select up to {MAX_PINS} items to showcase at the top of your profile.
              </CardDescription>
            </div>
            <Badge variant={pinnedCount === MAX_PINS ? "destructive" : "secondary"}>
              {pinnedCount} / {MAX_PINS} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                No projects or work experience found to pin. Add some first!
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all
                    ${item.is_pinned 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${item.type === 'project' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                      {item.type === 'project' ? <FolderGit2 className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${item.is_pinned ? 'text-blue-900' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={item.is_pinned ? "default" : "outline"}
                    className={item.is_pinned ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => handleTogglePin(item)}
                    disabled={!item.is_pinned && pinnedCount >= MAX_PINS}
                  >
                    {item.is_pinned ? 'Pinned' : 'Pin'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Pinned items appear directly below your bio on your public profile. 
          Use this space to highlight your most impressive work or current role.
        </p>
      </div>
    </div>
  );
};
