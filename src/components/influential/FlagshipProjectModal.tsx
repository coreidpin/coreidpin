import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import type { FlagshipProject, FlagshipProjectInput } from '../../types/influential';
import { saveFlagshipProject } from '../../utils/influentialProfessionals';
import { toast } from 'sonner';

interface FlagshipProjectModalProps {
  userId: string;
  project: FlagshipProject | null;
  onClose: () => void;
}

export function FlagshipProjectModal({ userId, project, onClose }: FlagshipProjectModalProps) {
  const [formData, setFormData] = useState<FlagshipProjectInput>({
    title: project?.title || '',
    description: project?.description || '',
    impact_metrics: project?.impact_metrics || {},
    tech_stack: project?.tech_stack || [],
    project_url: project?.project_url || '',
    media_urls: project?.media_urls || [],
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    is_ongoing: project?.is_ongoing || false,
    is_visible: project?.is_visible ?? true,
  });

  const [newMetricKey, setNewMetricKey] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newTech, setNewTech] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setSaving(true);
    const result = await saveFlagshipProject(userId, formData, project?.id);
    setSaving(false);

    if (result.success) {
      toast.success(project ? 'Project updated successfully' : 'Project added successfully');
      onClose();
    } else {
      toast.error(result.error || 'Failed to save project');
    }
  };

  const handleAddMetric = () => {
    if (newMetricKey.trim() && newMetricValue.trim()) {
      setFormData({
        ...formData,
        impact_metrics: {
          ...formData.impact_metrics,
          [newMetricKey]: newMetricValue,
        },
      });
      setNewMetricKey('');
      setNewMetricValue('');
    }
  };

  const handleRemoveMetric = (key: string) => {
    const { [key]: removed, ...rest } = formData.impact_metrics || {};
    setFormData({ ...formData, impact_metrics: rest });
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.tech_stack?.includes(newTech.trim())) {
      setFormData({
        ...formData,
        tech_stack: [...(formData.tech_stack || []), newTech.trim()],
      });
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack?.filter(t => t !== tech) || [],
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0b0d] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">
            {project ? 'Edit Flagship Project' : 'Add Flagship Project'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Showcase your most impactful work and achievements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Project Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Led Re-architecture of Payment Platform"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project, your role, and the outcomes..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Impact Metrics */}
          <div className="space-y-2">
            <Label className="text-white">Impact Metrics</Label>
            <div className="space-y-2">
              {Object.entries(formData.impact_metrics || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <p className="text-white/40 text-xs">{key}</p>
                    <p className="text-[#32f08c] font-semibold">{value}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMetric(key)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Metric name (e.g., Users Impacted)"
                  value={newMetricKey}
                  onChange={(e) => setNewMetricKey(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Input
                  placeholder="Value (e.g., 50K)"
                  value={newMetricValue}
                  onChange={(e) => setNewMetricValue(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  onClick={handleAddMetric}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label className="text-white">Tech Stack</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.tech_stack?.map((tech) => (
                  <div key={tech} className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-white text-sm">{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-white/60 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add technology (e.g., React, Node.js)"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  onClick={handleAddTech}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Project URL */}
          <div className="space-y-2">
            <Label htmlFor="project_url" className="text-white">
              Project URL (optional)
            </Label>
            <Input
              id="project_url"
              type="url"
              value={formData.project_url || ''}
              onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
              placeholder="https://example.com/project"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-white">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_ongoing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Ongoing Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
            <div>
              <Label htmlFor="is_ongoing" className="text-white">
                Ongoing Project
              </Label>
              <p className="text-white/60 text-sm">This project is currently active</p>
            </div>
            <Switch
              id="is_ongoing"
              checked={formData.is_ongoing}
              onCheckedChange={(checked) => setFormData({ ...formData, is_ongoing: checked })}
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
            <div>
              <Label htmlFor="is_visible" className="text-white">
                Publicly Visible
              </Label>
              <p className="text-white/60 text-sm">Show this project on your public profile</p>
            </div>
            <Switch
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black"
            >
              {saving ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
