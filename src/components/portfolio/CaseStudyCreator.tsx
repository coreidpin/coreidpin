/**
 * Case Study Creator - Simplified Version
 * Quick and beautiful case study creation
 */

import React, { useState } from 'react';
import { X, Save, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ImageUploader } from './ImageUploader';
import { TagInput } from './TagInput';
import { MetricCard } from './MetricCard';
import { VideoPlayer } from './VideoPlayer';
import type { CaseStudyFormData } from '../../types/portfolio';
import { toast } from '../../utils/toast';

interface CaseStudyCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseStudy: CaseStudyFormData) => Promise<void>;
  initialData?: Partial<CaseStudyFormData>;
}

export const CaseStudyCreator: React.FC<CaseStudyCreatorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [client, setClient] = useState(initialData?.client || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tools, setTools] = useState<string[]>(initialData?.tools || []);
  
  // Problem section
  const [problemStatement, setProblemStatement] = useState(
    initialData?.problem?.statement || ''
  );
  const [problemContext, setProblemContext] = useState(
    initialData?.problem?.context || ''
  );
  
  // Process section
  const [processResearch, setProcessResearch] = useState(
    initialData?.process?.research || ''
  );
  const [processIdeation, setProcessIdeation] = useState(
    initialData?.process?.ideation || ''
  );
  
  // Solution section
  const [solutionDescription, setSolutionDescription] = useState('');
  const [solutionImages, setSolutionImages] = useState<string[]>([]);
  const [prototypeLink, setPrototypeLink] = useState(
    initialData?.solution?.prototype || ''
  );
  const [videoUrl, setVideoUrl] = useState(
    initialData?.solution?.videoUrl || ''
  );
  
  // Impact section
  const [impactDescription, setImpactDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        client,
        year,
        coverImage,
        role,
        tags,
        tools,
        problem: {
          statement: problemStatement,
          context: problemContext,
          constraints: []
        },
        process: {
          research: processResearch,
          ideation: processIdeation,
          wireframes: [],
          iterations: []
        },
        solution: {
          finalDesigns: solutionImages.map(url => ({ url })),
          prototype: prototypeLink,
          videoUrl,
          annotations: []
        },
        impact: {
          metrics: [],
          testimonials: [impactDescription],
          awards: []
        },
        isFeatured: false,
        isPublished: false
      });
      
      // Show success message
      toast.success('🎨 Case study created successfully!');
      
      onClose();
    } catch (error) {
      console.error('Failed to save case study:', error);
      toast.error('Failed to create case study. Please try again.');
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
                <h2 className="text-2xl font-bold text-gray-900">Create Case Study</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Basic Info */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Airbnb Mobile App Redesign"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client/Company</label>
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="Airbnb"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2024"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Lead Designer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Cover Image */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
                  <ImageUploader
                    value={coverImage}
                    onChange={(url) => setCoverImage(url as string)}
                    aspectRatio="video"
                    preview
                  />
                </section>

                {/* Problem */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">The Problem</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Problem Statement</label>
                      <textarea
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        placeholder="What problem were you solving?"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
                      <textarea
                        value={problemContext}
                        onChange={(e) => setProblemContext(e.target.value)}
                        placeholder="Background and context..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Process */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Process</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Research</label>
                      <textarea
                        value={processResearch}
                        onChange={(e) => setProcessResearch(e.target.value)}
                        placeholder="User research, competitive analysis..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ideation</label>
                      <textarea
                        value={processIdeation}
                        onChange={(e) => setProcessIdeation(e.target.value)}
                        placeholder="Brainstorming, wireframes, iterations..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Solution */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">The Solution</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Final Designs</label>
                      <ImageUploader
                        value={solutionImages}
                        onChange={(urls) => setSolutionImages(urls as string[])}
                        multiple
                        maxFiles={10}
                        preview
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prototype Link (Optional)</label>
                      <input
                        type="url"
                        value={prototypeLink}
                        onChange={(e) => setPrototypeLink(e.target.value)}
                        placeholder="https://figma.com/..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video Walkthrough (YouTube/Vimeo)</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                      />
                      {videoUrl && (
                        <div className="mt-2">
                          <VideoPlayer url={videoUrl} className="w-full max-w-md" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Impact */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact & Results</h3>
                  <textarea
                    value={impactDescription}
                    onChange={(e) => setImpactDescription(e.target.value)}
                    placeholder="What was the outcome? Include metrics if possible..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </section>

                {/* Tags & Tools */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    tags={tags}
                    onAdd={(tag) => setTags([...tags, tag])}
                    onRemove={(tag) => setTags(tags.filter(t => t !== tag))}
                    label="Tags"
                    placeholder="e.g., Mobile, E-commerce"
                    suggestions={['UI/UX', 'Mobile App', 'Web Design', 'Branding', 'E-commerce']}
                  />
                  <TagInput
                    tags={tools}
                    onAdd={(tool) => setTools([...tools, tool])}
                    onRemove={(tool) => setTools(tools.filter(t => t !== tool))}
                    label="Tools Used"
                    placeholder="e.g., Figma"
                    suggestions={['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects']}
                  />
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
                    disabled={!title.trim() || submitting}
                    className={cn(
                      'flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2',
                      'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? 'Saving...' : 'Save Case Study'}
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
