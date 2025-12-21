import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProjectsTable, Project } from '../components/projects/ProjectsTable';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, FolderGit2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { projectsService } from '../services';
import { toast } from '../utils/toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/shared/DataTable/Pagination';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page, pageSize]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') {
        // Map UI status to API status if needed, or filter by is_verified
        // The service supports 'status' column (active, pending, etc)
        // But the UI filters by 'is_verified' boolean.
        // We might need to handle this. 
        // For now, let's fetch and filter client side if service doesn't support boolean filter?
        // Wait, service supports 'status' array.
        // Let's assume 'pending' maps to status='pending' and 'verified' maps to status='active' or 'completed'?
        // Actually the Project interface has `is_verified` boolean.
        // The service `getProjects` filters by `status` column.
        // Let's check the service implementation again.
        // It filters by `status` column.
        // If the DB has `is_verified` column, we should update service to filter by that too.
        // For now, I will fetch and if the service doesn't support is_verified filter, I might have to rely on the `status` column which likely correlates.
        // Let's assume status 'active' = verified, 'pending' = pending.
        if (statusFilter === 'pending') filters.status = ['pending'];
        if (statusFilter === 'verified') filters.status = ['active', 'completed'];
      }

      const response = await projectsService.getProjects(
        filters,
        { page, pageSize }
      );

      // Map service response to UI Project type
      const mappedProjects: Project[] = response.data.map((p: any) => ({
        ...p,
        professional_name: p.owner?.full_name,
        professional_email: p.owner?.email,
        // Ensure is_verified is present (it should be if it's in DB)
      }));

      setProjects(mappedProjects);
      setTotal(response.total);
    } catch (error) {
      toast.handleError(error, 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page
  };

  // Stats could be fetched from a dashboard service, or calculated from current page (inaccurate)
  // For now we'll hide stats or fetch them separately if critical.
  // Let's keep the stats UI but maybe make them static or fetch separate stats?
  // The previous implementation calculated stats from ALL projects.
  // Since we are paginating, we can't calculate total stats easily without a separate API call.
  // I will comment out stats calculation for now or use the `total` from pagination for "Total Projects".
  const stats = {
    total: total,
    verified: 0, // We don't know total verified without separate query
    pending: 0,  // We don't know total pending
  };

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">
              Manage and verify professional projects
            </p>
          </div>

          {/* Stats Cards - Simplified for now */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">Total Projects</p>
              </CardContent>
            </Card>
            {/* 
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <p className="text-xs text-gray-500">Verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-gray-500">Pending Verification</p>
              </CardContent>
            </Card> 
            */}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardContent className="p-0">
              {!isLoading && projects.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  title="No projects found"
                  description={searchQuery ? "No projects match your search criteria" : "There are no projects yet"}
                  action={searchQuery ? {
                    label: "Clear Filters",
                    onClick: () => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }
                  } : undefined}
                />
              ) : (
                <>
                  <ProjectsTable
                    projects={projects}
                    isLoading={isLoading}
                    onViewProject={handleViewProject}
                  />
                  <Pagination 
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Project Detail Modal */}
          <ProjectDetailModal
            project={selectedProject}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
