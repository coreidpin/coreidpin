import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Pin, Briefcase, FolderGit2, Calendar, Star } from 'lucide-react';
import { getPinnedItems } from '../../lib/api/github-profile-features';

interface PinnedItemsGridProps {
  userId: string;
}

export const PinnedItemsGrid: React.FC<PinnedItemsGridProps> = ({ userId }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPins();
  }, [userId]);

  const loadPins = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const pins = await getPinnedItems(userId);
      setItems(pins);
    } catch (error) {
      console.error('Failed to load pins:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Don't show if nothing pinned
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
        <Pin className="w-4 h-4" />
        Pinned
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card 
            key={item.id}
            className="bg-white border border-gray-200 hover:border-gray-400 transition-colors shadow-sm group"
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.type === 'project' ? (
                     <FolderGit2 className="w-4 h-4 text-gray-400" />
                  ) : (
                     <Briefcase className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-semibold text-blue-600 group-hover:underline truncate">
                    {item.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                  {item.type === 'project' ? 'Project' : 'Work'}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                {item.subtitle || item.description || 'No description provided.'}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
                {/* Optional: Add tech stack or date here */}
                {item.type === 'project' && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span>JavaScript</span>
                  </div>
                )}
                 {item.type === 'work' && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
