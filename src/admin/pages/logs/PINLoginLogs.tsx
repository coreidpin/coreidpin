import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { PINLoginLogsTable } from '../../components/logs/PINLoginLogsTable';
import { AuthLog } from '../../components/logs/AuthLogsTable';
import { PINLoginLogDetailModal } from '../../components/logs/PINLoginLogDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Search, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { logsService } from '../../services';
import { toast } from '../../utils/toast';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/shared/DataTable/Pagination';

export function PINLoginLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuthLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page, pageSize]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await logsService.getPINLoginLogs(
        filters,
        { page, pageSize }
      );

      setLogs(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.handleError(error, 'Failed to fetch PIN login logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLog = (log: AuthLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
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
    success: 0,
    failed: 0,
    blocked: 0,
  };

  return (
    <AdminLayout onLogout={() => window.location.href = '/login'}>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/dashboard')} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PIN Login Logs</h1>
                <p className="text-gray-500 mt-1">
                  Monitor PIN-based authentication attempts and security
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">Total Attempts</p>
              </CardContent>
            </Card>
            {/* Stats hidden for now */}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by email, phone, IP..."
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="text-black"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PIN Login Logs Table */}
          <Card>
            <CardContent className="p-0">
              {!isLoading && logs.length === 0 ? (
                <EmptyState
                  icon={KeyRound}
                  title="No logs found"
                  description={searchQuery ? "No logs match your search criteria" : "There are no logs yet"}
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
                  <PINLoginLogsTable
                    logs={logs}
                    isLoading={isLoading}
                    onViewLog={handleViewLog}
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

          {/* PIN Login Log Detail Modal */}
          <PINLoginLogDetailModal
            log={selectedLog}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
