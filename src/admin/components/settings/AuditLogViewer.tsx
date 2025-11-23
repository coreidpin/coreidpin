import React, { useEffect, useState } from 'react';
import { DataTable } from '../shared/DataTable/DataTable';
import { TableColumn } from '../shared/DataTable/DataTableHeader';
import { toast } from 'sonner';
import { StatusBadge, StatusType } from '../shared/StatusBadge/StatusBadge';

// Mock interface for audit logs
interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  status: 'success' | 'failure';
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    // Mock data loading
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          action: 'Update Settings',
          actor: 'admin@coreid.com',
          target: 'System Settings',
          timestamp: new Date().toISOString(),
          status: 'success',
        },
        {
          id: '2',
          action: 'Invite Admin',
          actor: 'admin@coreid.com',
          target: 'newadmin@coreid.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
        },
        {
          id: '3',
          action: 'Delete User',
          actor: 'super_admin@coreid.com',
          target: 'user_123',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'failure',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const columns: TableColumn<AuditLog>[] = [
    {
      key: 'action',
      label: 'Action',
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: 'actor',
      label: 'Actor',
    },
    {
      key: 'target',
      label: 'Target',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'success' ? 'active' : 'rejected'}
          size="sm"
        />
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (value) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Audit Logs</h2>
        <p className="text-sm text-gray-500">View recent administrative actions.</p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        emptyMessage="No audit logs found."
      />
    </div>
  );
}
