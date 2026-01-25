import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Code2, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { FlagshipProject } from '../../types/influential';
import { getFlagshipProjects, deleteFlagshipProject, toggleProjectVisibility } from '../../utils/influentialProfessionals';
import { toast } from 'sonner';
import { FlagshipProjectModal } from './FlagshipProjectModal';

interface FlagshipProjectsProps {
  userId: string;
  isOwnProfile: boolean;
}

export function FlagshipProjects({ userId, isOwnProfile }: FlagshipProjectsProps) {
  const [projects, setProjects] = useState<FlagshipProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<FlagshipProject | null>(null);

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getFlagshipProjects(userId);
    setProjects(data);
    setLoading(false);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const result = await deleteFlagshipProject(userId, projectId);
    if (result.success) {
      toast.success('Project deleted successfully');
      loadProjects();
    } else {
      toast.error(result.error || 'Failed to delete project');
    }
  };

  const handleToggleVisibility = async (projectId: string, currentVisibility: boolean) => {
    const result = await toggleProjectVisibility(userId, projectId, !currentVisibility);
    if (result.success) {
      toast.success(currentVisibility ? 'Project hidden' : 'Project made visible');
      loadProjects();
    } else {
      toast.error(result.error || 'Failed to update visibility');
    }
  };

  const handleEdit = (project: FlagshipProject) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
    loadProjects();
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Flagship Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#32f08c] border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleProjects = projects.filter(p => p.is_visible || isOwnProfile);

  return (
    <>
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#32f08c]" />
              Flagship Projects
            </CardTitle>
            <CardDescription className="text-white/60">
              {isOwnProfile ? 'Showcase your most impactful achievements' : 'Top achievements and contributions'}
            </CardDescription>
          </div>
          {isOwnProfile && (
            <Button 
              onClick={handleAdd}
              className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {visibleProjects.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">
                {isOwnProfile ? 'No flagship projects yet' : 'No projects to display'}
              </p>
              {isOwnProfile && (
                <p className="text-white/40 text-sm mb-6">
                  Highlight your most impactful work to stand out
                </p>
              )}
              {isOwnProfile && (
                <Button 
                  onClick={handleAdd}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {visibleProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-[#32f08c]/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            {/* Title and URL */}
                            <div className="flex items-start gap-3 mb-3">
                              <h3 className="text-xl font-semibold text-white flex-1">
                                {project.title}
                              </h3>
                              {project.project_url && (
                                <a 
                                  href={project.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#32f08c] hover:text-[#32f08c]/80 transition-colors"
                                >
                                  <ExternalLink className="h-5 w-5" />
                                </a>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-white/70 mb-4 leading-relaxed">
                              {project.description}
                            </p>

                            {/* Impact Metrics */}
                            {Object.keys(project.impact_metrics || {}).length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {Object.entries(project.impact_metrics).map(([key, value]) => (
                                  <div key={key} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-white/40 text-xs mb-1">{key}</p>
                                    <p className="text-[#32f08c] font-semibold">{value}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tech Stack */}
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <Code2 className="h-4 w-4 text-white/40" />
                                {project.tech_stack.map((tech) => (
                                  <Badge 
                                    key={tech}
                                    variant="outline"
                                    className="bg-white/5 border-white/20 text-white/80"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Timeline */}
                            {(project.start_date || project.is_ongoing) && (
                              <div className="flex items-center gap-2 text-white/50 text-sm">
                                <Calendar className="h-4 w-4" />
                                {project.start_date && (
                                  <span>
                                    {new Date(project.start_date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                )}
                                {project.is_ongoing ? (
                                  <span className="text-[#32f08c]">• Ongoing</span>
                                ) : project.end_date && (
                                  <>
                                    <span>-</span>
                                    <span>
                                      {new Date(project.end_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions (Own Profile Only) */}
                          {isOwnProfile && (
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(project)}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleVisibility(project.id, project.is_visible)}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                {project.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(project.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit */}
      {showModal && (
        <FlagshipProjectModal
          userId={userId}
          project={editingProject}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
