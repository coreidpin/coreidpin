/**
 * Engineering Project List Component
 * Shows all engineering projects with filters
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Grid, List as ListIcon } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import type { EngineeringProject } from '../../types/portfolio';
import { getProjects, deleteProject } from '../../utils/project-api';
import { toast } from '../../utils/toast';

interface ProjectListProps {
  userId: string;
  editable?: boolean;
  onAddClick?: () => void;
  onEditClick?: (project: EngineeringProject) => void;
  refreshTrigger?: number;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'published' | 'draft' | 'production' | 'beta';

export const ProjectList: React.FC<ProjectListProps> = ({
  userId,
  editable = false,
  onAddClick,
  onEditClick,
  refreshTrigger,
  className
}) => {
  const [projects, setProjects] = useState<EngineeringProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterMode>('all');

  // Load projects
  useEffect(() => {
    loadProjects();
  }, [userId, refreshTrigger]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects(userId);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    switch (filter) {
      case 'published':
        return project.isPublished;
      case 'draft':
        return !project.isPublished;
      case 'production':
        return project.status === 'Production';
      case 'beta':
        return project.status === 'Beta';
      default:
        return true;
    }
  });

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('🗑️ Project deleted');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Handle view
  const handleView = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project && onEditClick) {
      onEditClick(project);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0 && !editable) {
    return null; // Don't show empty section on public profiles
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Engineering Projects</span>
            <span className="text-sm font-normal text-gray-500">
              ({filteredProjects.length})
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Technical projects with code repositories and live demos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {!editable && projects.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Add Button */}
          {editable && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {editable && projects.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {(['all', 'published', 'draft', 'production', 'beta'] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && editable && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Engineering Projects Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create your first project to showcase your technical work
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Project
          </button>
        </div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 && (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                role={project.role}
                techStack={project.techStack}
                repositoryUrl={project.repositoryUrl}
                liveDemoUrl={project.liveDemoUrl}
                coverImage={project.coverImage}
                status={project.status}
                impact={project.impact}
                viewCount={project.viewCount}
                editable={editable}
                onEdit={handleView}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
