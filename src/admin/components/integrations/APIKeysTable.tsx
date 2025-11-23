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
import { MoreHorizontal, Eye, Copy, XCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  key_preview: string;
  description?: string;
  client_name: string;
  client_contact?: string;
  client_organization?: string;
  status: 'active' | 'revoked' | 'expired';
  rate_limit: number;
  permissions: string[];
  allowed_endpoints?: string[];
  total_requests: number;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
  revoked_at?: string;
  created_by: string;
  metadata?: any;
}

interface APIKeysTableProps {
  apiKeys: APIKey[];
  isLoading: boolean;
  onViewKey: (key: APIKey) => void;
  onCopyKey: (key: string) => void;
  onRevokeKey: (keyId: string) => void;
}

export function APIKeysTable({ apiKeys, isLoading, onViewKey, onCopyKey, onRevokeKey }: APIKeysTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading API keys...</div>;
  }

  const getStatusBadge = (status: string, expiresAt?: string) => {
    // Check if expired by date even if status is active
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'revoked':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Clock className="h-3 w-3 mr-1" />
            Expired
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

  const formatRateLimit = (limit: number) => {
    if (limit >= 1000000) {
      return `${(limit / 1000000).toFixed(1)}M/min`;
    } else if (limit >= 1000) {
      return `${(limit / 1000).toFixed(1)}K/min`;
    }
    return `${limit}/min`;
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Client/Partner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Rate Limit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                No API keys found. Create your first API key to get started.
              </TableCell>
            </TableRow>
          ) : (
            apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{apiKey.name}</div>
                    {apiKey.description && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {apiKey.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-600">
                      {apiKey.key_preview}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onCopyKey(apiKey.key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{apiKey.client_name}</div>
                    {apiKey.client_organization && (
                      <div className="text-xs text-gray-500">
                        {apiKey.client_organization}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(apiKey.status, apiKey.expires_at)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(apiKey.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(apiKey.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {apiKey.last_used_at ? (
                    <div className="text-sm">
                      <div>{new Date(apiKey.last_used_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(apiKey.last_used_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {formatRateLimit(apiKey.rate_limit)}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => onViewKey(apiKey)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopyKey(apiKey.key)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Key
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {apiKey.status === 'active' && (
                        <>
                          <DropdownMenuItem className="text-blue-600">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate Key
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onRevokeKey(apiKey.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Revoke Key
                          </DropdownMenuItem>
                        </>
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
