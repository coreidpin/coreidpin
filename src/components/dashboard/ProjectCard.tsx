import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Briefcase, Pencil, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { Project } from '../../types/dashboard';

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col group">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onEdit(project)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={project.title}>{project.title}</h3>
          <p className="text-sm font-medium text-blue-600 mb-3">{project.role}</p>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>
          
          <div className="space-y-4 mt-auto">
            <div className="flex flex-wrap gap-2">
              {(project.skills || []).slice(0, 3).map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-normal">
                  {skill}
                </Badge>
              ))}
              {(project.skills || []).length > 3 && (
                <Badge variant="secondary" className="bg-gray-50 text-gray-500 font-normal">
                  +{(project.skills || []).length - 3}
                </Badge>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{project.timeline}</span>
              </div>
              {project.links && project.links.length > 0 && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
