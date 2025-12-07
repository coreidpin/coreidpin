import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ImageIcon } from 'lucide-react';
import type { Project } from '@/types/dashboard';

interface PortfolioCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

export function PortfolioCard({ project, index, onClick }: PortfolioCardProps) {
  const isCaseStudy = project.project_type === 'case_study';
  const hasMedia = (project.media_urls?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
        {/* Featured Image */}
        {project.featured_image_url ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={project.featured_image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isCaseStudy && (
              <Badge className="absolute top-3 left-3 bg-white/90 text-purple-700 border-0">
                Case Study
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}

        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-sm font-medium text-blue-600 mb-3">
            {project.role}
          </p>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {project.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(project.skills || []).slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {skill}
              </Badge>
            ))}
            {(project.skills || []).length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-500">
                +{(project.skills || []).length - 3}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.timeline}
            </div>
            {hasMedia && (
              <div className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {project.media_urls?.length}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
