import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  technologies?: string[];
  project_url?: string;
  github_url?: string;
  start_date?: string;
  end_date?: string;
  is_verified: boolean;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  professional_name?: string;
  professional_email?: string;
}

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  onViewProject: (project: Project) => void;
}

export function ProjectsTable({ projects, isLoading, onViewProject }: ProjectsTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading projects...</div>;
  }

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Pending
      </Badge>
    );
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Title</TableHead>
            <TableHead>Professional</TableHead>
            <TableHead>Technologies</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <div className="max-w-xs">
                    <div className="font-medium truncate">{project.title}</div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {project.description?.substring(0, 60)}
                      {project.description && project.description.length > 60 ? '...' : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {project.professional_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {project.professional_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {project.technologies?.slice(0, 3).map((tech, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies && project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(project.is_verified)}
                </TableCell>
                <TableCell>
                  {new Date(project.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-black">
                        <MoreHorizontal className="h-4 w-4 text-black" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewProject(project)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!project.is_verified && (
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <Flag className="mr-2 h-4 w-4" />
                        Flag for Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
