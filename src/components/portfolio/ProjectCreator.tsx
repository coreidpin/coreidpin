/**
 * Engineering Project Creator
 * Form for creating/editing engineering projects
 */

import React, { useState } from 'react';
import { X, Save, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ImageUploader } from './ImageUploader';
import { TagInput } from './TagInput';
import type { ProjectFormData } from '../../types/portfolio';
import { toast } from '../../utils/toast';

interface ProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectFormData) => Promise<void>;
  initialData?: Partial<ProjectFormData>;
}

export const ProjectCreator: React.FC<ProjectCreatorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [status, setStatus] = useState<'Production' | 'Beta' | 'Archived' | 'In Progress'>(
    initialData?.status || 'In Progress'
  );
  
  // Links & Media
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repositoryUrl || '');
  const [liveDemoUrl, setLiveDemoUrl] = useState(initialData?.liveDemoUrl || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || []);
  
  // Tech Stack
  const [techStack, setTechStack] = useState<string[]>(initialData?.techStack || []);
  
  // Impact Metrics
  const [usersServed, setUsersServed] = useState<number | undefined>(
    initialData?.impact?.usersServed
  );
  const [performanceGain, setPerformanceGain] = useState(
    initialData?.impact?.performanceGain || ''
  );
  const [scalability, setScalability] = useState(
    initialData?.impact?.scalability || ''
  );
  const [testCoverage, setTestCoverage] = useState<number | undefined>(
    initialData?.impact?.testCoverage
  );
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        role: role.trim(),
        duration: duration.trim(),
        status,
        techStack,
        repositoryUrl: repositoryUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        coverImage,
        screenshots,
        impact: {
          usersServed,
          performanceGain: performanceGain.trim(),
          scalability: scalability.trim(),
          testCoverage,
          customMetrics: []
        },
        isFeatured: false,
        isPublished: false
      });
      
      toast.success('🚀 Project created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">Create Engineering Project</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Basic Information */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Real-time Analytics Dashboard"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief overview of the project..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Lead Developer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g., 6 months"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Production">Production</option>
                        <option value="Beta">Beta</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Tech Stack */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack</h3>
                  <TagInput
                    tags={techStack}
                    onAdd={(tag) => setTechStack([...techStack, tag])}
                    onRemove={(tag) => setTechStack(techStack.filter(t => t !== tag))}
                    label="Technologies Used"
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    suggestions={['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes']}
                  />
                </section>

                {/* Links */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Github className="inline h-4 w-4 mr-1" />
                        Repository URL
                      </label>
                      <input
                        type="url"
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ExternalLink className="inline h-4 w-4 mr-1" />
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        value={liveDemoUrl}
                        onChange={(e) => setLiveDemoUrl(e.target.value)}
                        placeholder="https://demo.example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Media */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                      <ImageUploader
                        value={coverImage}
                        onChange={(url) => setCoverImage(url as string)}
                        aspectRatio="video"
                        preview
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Screenshots</label>
                      <ImageUploader
                        value={screenshots}
                        onChange={(urls) => setScreenshots(urls as string[])}
                        multiple
                        maxFiles={10}
                        preview
                      />
                    </div>
                  </div>
                </section>

                {/* Impact Metrics */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact & Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Users Served</label>
                      <input
                        type="number"
                        value={usersServed || ''}
                        onChange={(e) => setUsersServed(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 50000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Coverage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={testCoverage || ''}
                        onChange={(e) => setTestCoverage(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 85"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Performance Gain</label>
                      <input
                        type="text"
                        value={performanceGain}
                        onChange={(e) => setPerformanceGain(e.target.value)}
                        placeholder="e.g., 3x faster"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scalability</label>
                      <input
                        type="text"
                        value={scalability}
                        onChange={(e) => setScalability(e.target.value)}
                        placeholder="e.g., Handles 10M requests/day"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className={cn(
                      'flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2',
                      'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? 'Saving...' : 'Save Project'}
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
