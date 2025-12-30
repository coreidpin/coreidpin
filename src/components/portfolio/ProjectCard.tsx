/**
 * Engineering Project Card
 * Displays an engineering project with GitHub stats and tech stack
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Eye, Code2, Users, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  role: string;
  techStack: string[];
  repositoryUrl?: string;
  liveDemoUrl?: string;
  coverImage?: string;
  status: 'Production' | 'Beta' | 'Archived' | 'In Progress';
  impact?: {
    usersServed?: number;
    performanceGain?: string;
    testCoverage?: number;
  };
  viewCount: number;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  role,
  techStack,
  repositoryUrl,
  liveDemoUrl,
  coverImage,
  status,
  impact,
  viewCount,
  editable = false,
  onEdit,
  onDelete,
  onView
}) => {
  const statusColors = {
    'Production': 'bg-green-100 text-green-700 border-green-200',
    'Beta': 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Archived': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn('border', statusColors[status])}>
              {status}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Tech Stack */}
        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techStack.slice(0, 4).map((tech, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Code2 className="h-3 w-3 mr-1" />
                {tech}
              </Badge>
            ))}
            {techStack.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                +{techStack.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Impact Metrics */}
        {impact && (
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
            {impact.usersServed && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{formatNumber(impact.usersServed)} users</span>
              </div>
            )}
            {impact.testCoverage && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{impact.testCoverage}% coverage</span>
              </div>
            )}
            {impact.performanceGain && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{impact.performanceGain}</span>
              </div>
            )}
          </div>
        )}

        {/* Links & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {liveDemoUrl && (
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount}</span>
            </div>
          </div>

          {editable && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView?.(id)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View
              </button>
              <button
                onClick={() => onEdit?.(id)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
