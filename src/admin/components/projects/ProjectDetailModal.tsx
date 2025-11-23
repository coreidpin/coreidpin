import React from 'react';
import { X, ExternalLink, Github, Calendar, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Project } from './ProjectsTable';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  if (!project) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{project.title}</DialogTitle>
              <div className="flex items-center gap-2">
                {project.is_verified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="professional">Professional Info</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">{project.description || 'No description provided.'}</p>
            </div>

            {project.technologies && project.technologies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Start:</span>{' '}
                    {formatDate(project.start_date)}
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>{' '}
                    {formatDate(project.end_date)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Links</h3>
                <div className="space-y-2">
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Project URL
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </a>
                  )}
                  {!project.project_url && !project.github_url && (
                    <p className="text-sm text-gray-500">No links provided</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Professional Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{project.professional_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{project.professional_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">User ID:</span>{' '}
                    <span className="font-mono text-xs">{project.user_id}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  View Professional Profile
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {project.is_verified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Project Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-600">
                        Pending Verification
                      </span>
                    </>
                  )}
                </div>

                {project.verification_notes && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-semibold mb-1">Verification Notes</h4>
                    <p className="text-sm text-gray-600">{project.verification_notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-3">Admin Actions</p>
                  <div className="flex gap-2">
                    {!project.is_verified && (
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Project
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="flex-1">
                      Request Changes
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Project Metadata</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  {formatDate(project.created_at)}
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  {formatDate(project.updated_at)}
                </div>
                <div>
                  <span className="text-gray-500">Project ID:</span>{' '}
                  <span className="font-mono text-xs">{project.id}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
