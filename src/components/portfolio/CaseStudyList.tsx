/**
 * Case Study List Component
 * Shows all case studies with filters
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Grid, List as ListIcon } from 'lucide-react';
import { CaseStudyCard } from './CaseStudyCard';
import type { CaseStudy } from '../../types/portfolio';
import { getCaseStudies, deleteCaseStudy } from '../../utils/case-study-api';
import { toast } from '../../utils/toast';

interface CaseStudyListProps {
  userId: string;
  editable?: boolean;
  onAddClick?: () => void;
  onEditClick?: (caseStudy: CaseStudy) => void;
  refreshTrigger?: number;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'published' | 'draft' | 'featured';

export const CaseStudyList: React.FC<CaseStudyListProps> = ({
  userId,
  editable = false,
  onAddClick,
  onEditClick,
  refreshTrigger,
  className
}) => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterMode>('all');

  // Load case studies
  useEffect(() => {
    loadCaseStudies();
  }, [userId, refreshTrigger]);

  const loadCaseStudies = async () => {
    try {
      setLoading(true);
      const data = await getCaseStudies(userId);
      setCaseStudies(data);
    } catch (error) {
      console.error('Failed to load case studies:', error);
      toast.error('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  // Filter case studies
  const filteredCaseStudies = caseStudies.filter(cs => {
    switch (filter) {
      case 'published':
        return cs.isPublished;
      case 'draft':
        return !cs.isPublished;
      case 'featured':
        return cs.isFeatured;
      default:
        return true;
    }
  });

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;

    try {
      await deleteCaseStudy(id);
      setCaseStudies(prev => prev.filter(cs => cs.id !== id));
      toast.success('🗑️ Case study deleted');
    } catch (error) {
      console.error('Failed to delete case study:', error);
      toast.error('Failed to delete case study');
    }
  };

  // Handle view
  const handleView = (id: string) => {
    const caseStudy = caseStudies.find(cs => cs.id === id);
    if (caseStudy && onEditClick) {
      onEditClick(caseStudy);
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

  if (caseStudies.length === 0 && !editable) {
    return null; // Don't show empty section on public profiles
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Case Studies</span>
            <span className="text-sm font-normal text-gray-500">
              ({filteredCaseStudies.length})
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed project showcases and design work
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {!editable && caseStudies.length > 0 && (
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
              <span className="hidden sm:inline">New Case Study</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {editable && caseStudies.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {(['all', 'published', 'draft', 'featured'] as FilterMode[]).map(f => (
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
      {filteredCaseStudies.length === 0 && editable && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Case Studies Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create your first case study to showcase your work
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Case Study
          </button>
        </div>
      )}

      {/* Case Studies Grid/List */}
      {filteredCaseStudies.length > 0 && (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence mode="popLayout">
            {filteredCaseStudies.map(caseStudy => (
              <CaseStudyCard
                key={caseStudy.id}
                id={caseStudy.id}
                title={caseStudy.title}
                coverImage={caseStudy.coverImage}
                client={caseStudy.client}
                year={caseStudy.year}
                role={caseStudy.role}
                tags={caseStudy.tags}
                isPublished={caseStudy.isPublished}
                isFeatured={caseStudy.isFeatured}
                viewCount={caseStudy.viewCount}
                slug={caseStudy.slug}
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
