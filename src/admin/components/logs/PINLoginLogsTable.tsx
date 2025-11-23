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
import { MoreHorizontal, Eye, CheckCircle, XCircle, Shield, Unlock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface PINLoginLog {
  id: string;
  user_id?: string;
  user_email?: string;
  phone_number?: string;
  status: 'success' | 'failed' | 'blocked';
  attempt_count: number;
  pin_sent: boolean;
  pin_verified: boolean;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  error_message?: string;
  blocked_until?: string;
  metadata?: any;
  created_at: string;
}

interface PINLoginLogsTableProps {
  logs: PINLoginLog[];
  isLoading: boolean;
  onViewLog: (log: PINLoginLog) => void;
}

export function PINLoginLogsTable({ logs, isLoading, onViewLog }: PINLoginLogsTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading PIN login logs...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Shield className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                No PIN login logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {log.user_email || 'N/A'}
                    </div>
                    {log.user_id && (
                      <div className="text-xs text-gray-500 font-mono">
                        {log.user_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {log.phone_number || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {log.attempt_count}
                    </Badge>
                    {log.attempt_count > 3 && (
                      <span className="text-xs text-orange-600">⚠️</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">
                    {log.ip_address || 'N/A'}
                  </span>
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
                      <DropdownMenuItem onClick={() => onViewLog(log)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {log.status === 'blocked' && (
                        <DropdownMenuItem className="text-green-600">
                          <Unlock className="mr-2 h-4 w-4" />
                          Unblock User
                        </DropdownMenuItem>
                      )}
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
