/**
 * Add Featured Item Modal
 * Simple form to add a custom featured item
 */

import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkInput } from './LinkInput';
import { cn } from '../../lib/utils';
import { toast } from '../../utils/toast';

interface AddFeaturedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    customTitle: string;
    customDescription: string;
    customLink?: string;
    customImage?: string;
  }) => Promise<void>;
}

export const AddFeaturedItemModal: React.FC<AddFeaturedItemModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onAdd({
        customTitle: title,
        customDescription: description,
        customLink: link || undefined
      });
      
      // Show success message
      toast.success('✨ Featured item added successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setLink('');
      onClose();
    } catch (error) {
      console.error('Failed to add featured item:', error);
      toast.error('Failed to add featured item. Please try again.');
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Featured Item
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Redesigned Mobile App"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this achievement..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {description.length}/200 characters
                  </p>
                </div>

                {/* Link */}
                <LinkInput
                  value={link}
                  onChange={setLink}
                  label="Link (optional)"
                  placeholder="https://..."
                  showPreview
                />

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
                    disabled={!title.trim() || submitting}
                    className={cn(
                      'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors',
                      'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {submitting ? 'Adding...' : 'Add to Featured'}
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
