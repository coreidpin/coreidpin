import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, X } from 'lucide-react';
import type { Project } from '@/types/dashboard';
import { MediaGallery } from './MediaGallery';
import { VideoPlayer } from './VideoPlayer';
import { GitHubStats } from './GitHubStats';
import { LiveDemoEmbed } from './LiveDemoEmbed';

interface CaseStudyViewerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function CaseStudyViewer({ project, open, onClose }: CaseStudyViewerProps) {
  if (!project) return null;

  const isCaseStudy = project.project_type === 'case_study';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Image */}
        {project.featured_image_url && (
          <div className="relative h-72 overflow-hidden">
            <img
              src={project.featured_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* Title & Meta */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {isCaseStudy && (
                <Badge className="bg-purple-100 text-purple-700 border-0">Case Study</Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {project.timeline}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-xl text-blue-600 mb-4">{project.role}</p>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>

          {/* Case Study Sections */}
          {isCaseStudy && (
            <div className="space-y-6">
              {project.challenge && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">The Challenge</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.challenge}
                  </p>
                </div>
              )}

              {project.solution && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">The Solution</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.solution}
                  </p>
                </div>
              )}

              {project.video_url && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Video Walkthrough</h2>
                  <VideoPlayer url={project.video_url} className="w-full max-w-3xl" />
                </div>
              )}

              {/* GitHub Stats for Engineering Projects */}
              {project.links && project.links.length > 0 && project.links[0]?.includes('github.com') && (
                <div className="mb-6">
                  <GitHubStats repoUrl={project.links[0]} />
                </div>
              )}

              {/* Live Demo Embed */}
              {project.links && project.links.length > 1 && project.links[1] && (
                <div className="mb-6">
                  <LiveDemoEmbed url={project.links[1]} title={`${project.title} - Live Demo`} />
                </div>
              )}

              {project.result && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">The Result</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.result}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Media Gallery */}
          {project.media_urls && project.media_urls.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Gallery</h2>
              <MediaGallery images={project.media_urls} />
            </div>
          )}

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-sm bg-gray-100 text-gray-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {project.links && project.links.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Links</h2>
              <div className="space-y-2">
                {project.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
