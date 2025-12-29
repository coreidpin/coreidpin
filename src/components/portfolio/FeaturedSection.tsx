/**
 * Featured Section Component
 * Displays up to 5 featured items at the top of a profile
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, GripVertical, ExternalLink, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FeaturedBadge } from './FeaturedBadge';
import { MetricCard } from './MetricCard';
import type { PopulatedFeaturedItem } from '../../types/portfolio';
import { getFeaturedItems, removeFeaturedItem, reorderFeaturedItems } from '../../utils/portfolio-api';

interface FeaturedSectionProps {
  userId: string;
  editable?: boolean;
  onAddClick?: () => void;
  refreshTrigger?: number; // Add this to trigger refresh
  className?: string;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  userId,
  editable = false,
  onAddClick,
  refreshTrigger,
  className
}) => {
  const [items, setItems] = useState<PopulatedFeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const MAX_FEATURED = 5;

  // Load featured items
  useEffect(() => {
    loadItems();
  }, [userId, refreshTrigger]); // Re-fetch when refreshTrigger changes

  const loadItems = async () => {
    try {
      const data = await getFeaturedItems(userId);
      setItems(data);
    } catch (error) {
      console.error('Failed to load featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const handleRemove = async (id: string) => {
    try {
      await removeFeaturedItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Drag & drop reordering
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setItems(newItems);
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    try {
      await reorderFeaturedItems(userId, items.map(item => item.id));
    } catch (error) {
      console.error('Failed to reorder items:', error);
      // Reload on error
      loadItems();
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0 && !editable) {
    return null; // Don't show empty section on public profiles
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Featured</h2>
          <span className="text-sm text-gray-500">
            ({items.length}/{MAX_FEATURED})
          </span>
        </div>

        {editable && items.length < MAX_FEATURED && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Featured
          </button>
        )}
      </div>

      {/* Featured Items Grid */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              draggable={editable}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative group bg-white border border-gray-200 rounded-xl p-4 transition-all',
                editable && 'hover:border-blue-300 hover:shadow-md cursor-move',
                draggedItem === item.id && 'opacity-50'
              )}
            >
              {/* Drag Handle */}
              {editable && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
              )}

              <div className={cn('flex items-start gap-4', editable && 'ml-6')}>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {(item as any).custom_title || `Featured Item ${index + 1}`}
                  </h3>
                  
                  {(item as any).custom_description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {(item as any).custom_description}
                    </p>
                  )}

                  {/* Item Type Badge */}
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {((item as any).item_type || 'custom').replace('_', ' ')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(item as any).custom_link && (
                    <a
                      href={(item as any).custom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {editable && (
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {items.length === 0 && editable && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Featured Items
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Pin your best work to showcase at the top of your profile
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Featured Item
          </button>
        </div>
      )}

      {/* Max reached notice */}
      {items.length >= MAX_FEATURED && editable && (
        <p className="text-xs text-amber-600 text-center">
          Maximum featured items reached. Remove one to add more.
        </p>
      )}
    </div>
  );
};
