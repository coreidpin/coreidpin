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
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Mail, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface EmailVerificationLog {
  id: string;
  user_id?: string;
  user_email: string;
  status: 'verified' | 'pending' | 'expired' | 'failed';
  token: string;
  token_status: 'valid' | 'expired' | 'used';
  link_sent_at: string;
  link_clicked_at?: string;
  verified_at?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

interface EmailVerificationLogsTableProps {
  logs: EmailVerificationLog[];
  isLoading: boolean;
  onViewLog: (log: EmailVerificationLog) => void;
}

export function EmailVerificationLogsTable({ logs, isLoading, onViewLog }: EmailVerificationLogsTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading email verification logs...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
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

  const getTokenStatusBadge = (tokenStatus: string) => {
    switch (tokenStatus) {
      case 'valid':
        return <Badge variant="outline" className="text-green-800 border-green-300">Valid</Badge>;
      case 'used':
        return <Badge variant="outline" className="text-blue-800 border-blue-300">Used</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-orange-800 border-orange-300">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry < 24;
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Token Status</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                No email verification logs found.
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
                    <div className="font-medium text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {log.user_email}
                    </div>
                    {log.user_id && (
                      <div className="text-xs text-gray-500 font-mono">
                        {log.user_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.status)}
                </TableCell>
                <TableCell>
                  {getTokenStatusBadge(log.token_status)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(log.expires_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.expires_at).toLocaleTimeString()}
                    </div>
                    {log.status === 'pending' && isExpiringSoon(log.expires_at) && (
                      <div className="text-xs text-orange-600 mt-1">
                        ⚠️ Expiring soon
                      </div>
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
                      {(log.status === 'pending' || log.status === 'expired') && (
                        <DropdownMenuItem className="text-blue-600">
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification
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
