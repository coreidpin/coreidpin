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
import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface AuthLog {
  id: string;
  user_id?: string;
  user_email?: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'email_verification' | 'session_expired';
  status: 'success' | 'failed' | 'suspicious';
  ip_address?: string;
  user_agent?: string;
  location?: string;
  device_fingerprint?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

interface AuthLogsTableProps {
  logs: AuthLog[];
  isLoading: boolean;
  onViewLog: (log: AuthLog) => void;
}

export function AuthLogsTable({ logs, isLoading, onViewLog }: AuthLogsTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading auth logs...</div>;
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
      case 'suspicious':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspicious
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

  const getEventTypeBadge = (eventType: string) => {
    const eventLabels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      failed_login: 'Failed Login',
      password_reset: 'Password Reset',
      email_verification: 'Email Verification',
      session_expired: 'Session Expired',
    };

    return (
      <Badge variant="outline" className="font-medium">
        {eventLabels[eventType] || eventType}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>User Agent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                No auth logs found.
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
                  {getEventTypeBadge(log.event_type)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.status)}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">
                    {log.ip_address || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm text-gray-600">
                    {log.user_agent || 'N/A'}
                  </div>
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
                      {log.status !== 'suspicious' && (
                        <DropdownMenuItem className="text-orange-600">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Flag as Suspicious
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
