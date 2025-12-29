/**
 * Add/Edit Tech Skill Modal
 * Form to add or edit a technical skill
 */

import React, { useState, useEffect } from 'react';
import { X, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { TechSkill, SkillCategory, SkillLevel } from '../../types/portfolio';
import { toast } from '../../utils/toast';

interface AddTechSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: {
    category: SkillCategory;
    name: string;
    level: SkillLevel;
    yearsExperience: number;
  }) => Promise<void>;
  editingSkill?: TechSkill | null;
}

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'language', label: 'Programming Language' },
  { value: 'framework', label: 'Framework/Library' },
  { value: 'tool', label: 'Tool/Software' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud Platform' },
  { value: 'other', label: 'Other' }
];

const LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'Beginner', label: 'Beginner', description: 'Learning the basics' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Can work independently' },
  { value: 'Advanced', label: 'Advanced', description: 'Deep expertise' },
  { value: 'Expert', label: 'Expert', description: 'Industry recognized' }
];

const COMMON_SKILLS: Record<SkillCategory, string[]> = {
  language: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin'],
  framework: ['React', 'Vue', 'Angular', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel'],
  tool: ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'VS Code', 'Figma', 'Postman', 'Webpack'],
  database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB'],
  cloud: ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku', 'Digital Ocean'],
  other: []
};

export const AddTechSkillModal: React.FC<AddTechSkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSkill
}) => {
  const [category, setCategory] = useState<SkillCategory>('language');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [yearsExperience, setYearsExperience] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load editing skill data
  useEffect(() => {
    if (editingSkill) {
      setCategory(editingSkill.category);
      setName(editingSkill.name);
      setLevel(editingSkill.level);
      setYearsExperience(editingSkill.yearsExperience);
    } else {
      // Reset form
      setCategory('language');
      setName('');
      setLevel('Intermediate');
      setYearsExperience(1);
    }
  }, [editingSkill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        category,
        name: name.trim(),
        level,
        yearsExperience
      });
      
      // Show success message
      toast.success(editingSkill ? '💻 Skill updated successfully!' : '💻 Skill added successfully!');
      
      onClose();
    } catch (error) {
      console.error('Failed to save skill:', error);
      toast.error('Failed to save skill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter suggestions
  const suggestions = COMMON_SKILLS[category].filter(skill =>
    skill.toLowerCase().includes(name.toLowerCase()) &&
    skill.toLowerCase() !== name.toLowerCase()
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingSkill ? 'Edit Skill' : 'Add Skill'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as SkillCategory);
                      setName(''); // Reset name when category changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={`e.g., ${COMMON_SKILLS[category][0] || 'Enter skill name'}`}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />

                  {/* Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setName(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proficiency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Proficiency Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setLevel(lvl.value)}
                        className={cn(
                          'p-3 border-2 rounded-lg text-left transition-all',
                          level === lvl.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="font-medium text-sm text-gray-900">{lvl.label}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{lvl.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className={cn(
                      'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors',
                      'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {submitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
