import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { EndorsementsTable, Endorsement } from '../components/endorsements/EndorsementsTable';
import { EndorsementDetailModal } from '../components/endorsements/EndorsementDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Award } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { endorsementsService } from '../services';
import { toast } from '../utils/toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/shared/DataTable/Pagination';

export function EndorsementsPage() {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'flagged' | 'rejected'>('all');
  const [selectedEndorsement, setSelectedEndorsement] = useState<Endorsement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEndorsements();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page, pageSize]);

  const fetchEndorsements = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') {
        filters.status = [statusFilter];
      }

      const response = await endorsementsService.getEndorsements(
        filters,
        { page, pageSize }
      );

      // Map service response to UI Endorsement type
      const mappedEndorsements: Endorsement[] = response.data.map((e: any) => ({
        ...e,
        endorsee_name: e.project?.owner?.full_name,
        endorsee_email: e.project?.owner?.email,
        endorser_name: e.endorser?.full_name,
        endorser_email: e.endorser?.email,
      }));

      setEndorsements(mappedEndorsements);
      setTotal(response.total);
    } catch (error) {
      toast.handleError(error, 'Failed to fetch endorsements');
      setEndorsements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEndorsement = (endorsement: Endorsement) => {
    setSelectedEndorsement(endorsement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEndorsement(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Stats placeholder
  const stats = {
    total: total,
    verified: 0,
    pending: 0,
    flagged: 0,
  };

  return (
    <AdminLayout onLogout={() => window.location.href = '/login'}>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Endorsements</h1>
            <p className="text-gray-500 mt-1">
              Manage and verify professional endorsements
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">Total Endorsements</p>
              </CardContent>
            </Card>
            {/* Stats hidden for now as they require separate API call */}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Endorsements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by skill, comment..."
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
                    <SelectItem value="all">All Endorsements</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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

          {/* Endorsements Table */}
          <Card>
            <CardContent className="p-0">
              {!isLoading && endorsements.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No endorsements found"
                  description={searchQuery ? "No endorsements match your search criteria" : "There are no endorsements yet"}
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
                  <EndorsementsTable
                    endorsements={endorsements}
                    isLoading={isLoading}
                    onViewEndorsement={handleViewEndorsement}
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

          {/* Endorsement Detail Modal */}
          <EndorsementDetailModal
            endorsement={selectedEndorsement}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
