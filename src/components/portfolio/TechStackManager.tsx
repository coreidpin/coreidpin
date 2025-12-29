/**
 * Tech Stack Manager Component
 * Visual display and management of technical skills
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Code, Database, Cloud, Wrench, Layers, Edit2, Trash2, TrendingUp, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TechSkill, SkillCategory, SkillLevel } from '../../types/portfolio';
import { getTechStack, removeTechSkill, getTechStackDistribution } from '../../utils/tech-stack-api';
import { endorseSkill, removeEndorsement, getUserEndorsements } from '../../utils/endorsements-api';
import { supabase } from '../../utils/supabase/client';
import { MetricBadge } from './MetricCard';
import { toast } from '../../utils/toast';

interface TechStackManagerProps {
  userId: string;
  editable?: boolean;
  onAddClick?: () => void;
  onEditClick?: (skill: TechSkill) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<SkillCategory, React.ReactNode> = {
  language: <Code className="h-4 w-4" />,
  framework: <Layers className="h-4 w-4" />,
  tool: <Wrench className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
  other: <TrendingUp className="h-4 w-4" />
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  language: 'blue',
  framework: 'purple',
  tool: 'orange',
  database: 'green',
  cloud: 'blue',
  other: 'gray'
};

const LEVEL_COLORS: Record<SkillLevel, string> = {
  'Beginner': 'bg-gray-200',
  'Intermediate': 'bg-blue-300',
  'Advanced': 'bg-purple-400',
  'Expert': 'bg-green-500'
};

export const TechStackManager: React.FC<TechStackManagerProps> = ({
  userId,
  editable = false,
  onAddClick,
  onEditClick,
  className
}) => {
  const [skills, setSkills] = useState<TechSkill[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  
  // Endorsement State
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [endorsedSkillIds, setEndorsedSkillIds] = useState<Set<string>>(new Set());

  // Load viewer
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setViewerId(data.user?.id || null);
    });
  }, []);

  // Load user endorsements
  useEffect(() => {
    if (viewerId && !editable && userId !== viewerId) {
      getUserEndorsements(viewerId).then((ids) => {
        setEndorsedSkillIds(new Set(ids));
      });
    }
  }, [viewerId, editable, userId]);

  useEffect(() => {
    loadSkills();
  }, [userId]);

  const loadSkills = async () => {
    try {
      const [skillsData, distData] = await Promise.all([
        getTechStack(userId),
        getTechStackDistribution(userId)
      ]);
      setSkills(skillsData);
      setDistribution(distData);
    } catch (error) {
      console.error('Failed to load tech stack:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeTechSkill(id, userId);
      setSkills(skills.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to remove skill:', error);
    }
  };


  // Handle endorsement toggle
  const handleEndorsementToggle = async (skill: TechSkill, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!viewerId) {
      toast.error('Please log in to endorse skills');
      return;
    }
    
    if (viewerId === userId) {
       return; // Owner cannot endorse self
    }
  
    const isEndorsed = endorsedSkillIds.has(skill.id);
    
    // Optimistic Update
    setSkills(prev => prev.map(s => {
      if (s.id === skill.id) {
         return {
           ...s,
           endorsementCount: (Number(s.endorsementCount) || 0) + (isEndorsed ? -1 : 1)
         };
      }
      return s;
    }));
    
    setEndorsedSkillIds(prev => {
       const next = new Set(prev);
       if (isEndorsed) next.delete(skill.id);
       else next.add(skill.id);
       return next;
    });
  
    try {
       if (isEndorsed) {
          await removeEndorsement(skill.id, viewerId);
       } else {
          await endorseSkill(skill.id, viewerId);
          toast.success(`Endorsed ${skill.name}!`);
       }
    } catch (err) {
        console.error(err);
        toast.error('Failed to update endorsement');
        loadSkills(); // Revert
    }
  };

  const filteredSkills = selectedCategory === 'all' ? skills : skills.filter(s => s.category === selectedCategory);

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, TechSkill[]>);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-gray-200 rounded-lg" />
      ))}
    </div>;
  }

  if (skills.length === 0 && !editable) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Tech Stack
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'} · {distribution.length} {distribution.length === 1 ? 'category' : 'categories'}
          </p>
        </div>

        {editable && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        )}
      </div>

      {/* Category Filter */}
      {skills.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All ({skills.length})
          </button>
          {Object.keys(groupedSkills).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as SkillCategory)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {CATEGORY_ICONS[cat as SkillCategory]}
              {cat} ({groupedSkills[cat as SkillCategory].length})
            </button>
          ))}
        </div>
      )}

      {/* Skills Grid */}
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn(
                      'p-1.5 rounded-lg',
                      `bg-${CATEGORY_COLORS[skill.category]}-100`
                    )}>
                      {CATEGORY_ICONS[skill.category]}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {skill.name}
                    </h3>
                  </div>

                  {/* Endorsement Badge / Button for Visitors */}
                  {!editable && userId !== viewerId && (
                    <button
                      onClick={(e) => handleEndorsementToggle(skill, e)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ml-2",
                        endorsedSkillIds.has(skill.id)
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      title={endorsedSkillIds.has(skill.id) ? "Remove endorsement" : "Endorse skill"}
                    >
                      <ThumbsUp className={cn("h-3 w-3", endorsedSkillIds.has(skill.id) && "fill-current")} />
                      <span>{skill.endorsementCount || 0}</span>
                    </button>
                  )}

                  {/* Static Endorsement Count for Owner */}
                  {(editable || userId === viewerId) && (Number(skill.endorsementCount) || 0) > 0 && (
                     <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium ml-2">
                        <ThumbsUp className="h-3 w-3 fill-blue-700" />
                        <span>{skill.endorsementCount}</span>
                     </div>
                  )}

                  {editable && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditClick?.(skill)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRemove(skill.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Level Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{skill.level}</span>
                    <span>{skill.yearsExperience}yr{skill.yearsExperience !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', LEVEL_COLORS[skill.level])}
                      style={{ 
                        width: `${skill.level === 'Expert' ? 100 : skill.level === 'Advanced' ? 75 : skill.level === 'Intermediate' ? 50 : 25}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {skill.percentage !== undefined && skill.percentage > 0 && (
                    <span className="font-medium">{skill.percentage}%</span>
                  )}
                  {skill.projectCount > 0 && (
                    <span>· {skill.projectCount} projects</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Skills Added
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Showcase your technical expertise by adding your skills
          </p>
          {editable && (
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Skill
            </button>
          )}
        </div>
      )}

      {/* Distribution Summary */}
      {distribution.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => {
            const totalPercentage = categorySkills.reduce((sum, s) => sum + (s.percentage || 0), 0);
            return (
              <MetricBadge
                key={category}
                label={category}
                value={categorySkills.length}
                icon={CATEGORY_ICONS[category as SkillCategory]}
                color={CATEGORY_COLORS[category as SkillCategory] as any}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
