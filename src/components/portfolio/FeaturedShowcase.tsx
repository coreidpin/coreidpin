/**
 * Featured Projects Showcase
 * Highlights selected projects in a carousel/grid
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'case_study' | 'engineering' | 'portfolio_item';
  tags: string[];
  link?: string;
}

interface FeaturedShowcaseProps {
  projects: FeaturedProject[];
  onProjectClick: (id: string) => void;
  className?: string;
}

export const FeaturedShowcase: React.FC<FeaturedShowcaseProps> = ({
  projects,
  onProjectClick,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!projects || projects.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const currentProject = projects[currentIndex];

  const projectTypeColors = {
    case_study: 'bg-purple-100 text-purple-700',
    engineering: 'bg-blue-100 text-blue-700',
    portfolio_item: 'bg-green-100 text-green-700',
  };

  return (
    <div className={cn('bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Featured Work</h2>
        </div>
        
        {projects.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
              aria-label="Previous project"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {projects.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
              aria-label="Next project"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Featured Project Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProject.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => onProjectClick(currentProject.id)}
        >
          {/* Image */}
          {currentProject.imageUrl && (
            <div className="relative h-64 overflow-hidden bg-gray-100">
              <img
                src={currentProject.imageUrl}
                alt={currentProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <Badge className={cn('border-0', projectTypeColors[currentProject.type])}>
                  {currentProject.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentProject.title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {currentProject.description}
            </p>

            {/* Tags */}
            {currentProject.tags && currentProject.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentProject.tags.slice(0, 5).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                    {tag}
                  </Badge>
                ))}
                {currentProject.tags.length > 5 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    +{currentProject.tags.length - 5}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProjectClick(currentProject.id);
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View Project
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Indicator */}
      {projects.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {projects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all',
                idx === currentIndex
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
