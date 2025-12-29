/**
 * Case Study Card Component
 * Beautiful card for displaying case studies in list view
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Calendar, Award, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CaseStudyCardProps {
  id: string;
  title: string;
  coverImage?: string;
  client?: string;
  year?: string;
  role?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  slug?: string;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export const CaseStudyCard: React.FC<CaseStudyCardProps> = ({
  id,
  title,
  coverImage,
  client,
  year,
  role,
  tags = [],
  isPublished = false,
  isFeatured = false,
  viewCount = 0,
  slug,
  editable = false,
  onEdit,
  onDelete,
  onView,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden transition-all group',
        'hover:border-blue-300 hover:shadow-lg cursor-pointer',
        className
      )}
      onClick={() => onView?.(id)}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="h-16 w-16 text-white/30" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              ⭐ Featured
            </span>
          )}
          {!isPublished && (
            <span className="px-2 py-1 bg-gray-900/80 text-white text-xs font-semibold rounded-full">
              Draft
            </span>
          )}
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
          <Eye className="h-3 w-3" />
          <span>{viewCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
          {client && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{client}</span>
            </div>
          )}
          {year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{year}</span>
            </div>
          )}
          {role && (
            <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              {role}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {editable && (
          <div 
            className="flex items-center gap-2 pt-3 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit?.(id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(id)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View Link for Non-Editable */}
        {!editable && slug && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium group-hover:gap-3 transition-all">
              <span>View Case Study</span>
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
