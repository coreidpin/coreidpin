import React from 'react';
import { Calendar, User, Shield, Key, TrendingUp, Lock, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { APIKey } from './APIKeysTable';

interface APIKeyDetailModalProps {
  apiKey: APIKey | null;
  isOpen: boolean;
  onClose: () => void;
}

export function APIKeyDetailModal({ apiKey, isOpen, onClose }: APIKeyDetailModalProps) {
  if (!apiKey) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatRateLimit = (limit: number) => {
    if (limit >= 1000000) {
      return `${(limit / 1000000).toFixed(1)}M requests/min`;
    } else if (limit >= 1000) {
      return `${(limit / 1000).toFixed(1)}K requests/min`;
    }
    return `${limit} requests/min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">API Key Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {apiKey.name}
                </Badge>
                {getStatusBadge(apiKey.status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Key Details</TabsTrigger>
            <TabsTrigger value="client">Client Info</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Key Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-medium">{apiKey.name}</span>
                </div>
                {apiKey.description && (
                  <div>
                    <span className="text-gray-500">Description:</span>{' '}
                    <span className="font-medium">{apiKey.description}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Key Preview:</span>{' '}
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {apiKey.key_preview}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  {getStatusBadge(apiKey.status)}
                </div>
                <div>
                  <span className="text-gray-500">Rate Limit:</span>{' '}
                  <Badge variant="outline" className="ml-2">
                    {formatRateLimit(apiKey.rate_limit)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="font-medium">{formatDate(apiKey.created_at)}</span>
                </div>
                {apiKey.expires_at && (
                  <div>
                    <span className="text-gray-500">Expires:</span>{' '}
                    <span className="font-medium">{formatDate(apiKey.expires_at)}</span>
                  </div>
                )}
                {apiKey.revoked_at && (
                  <div>
                    <span className="text-gray-500">Revoked:</span>{' '}
                    <span className="font-medium">{formatDate(apiKey.revoked_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {apiKey.status === 'active' && (
              <div className="pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-black">
                  <Lock className="h-4 w-4 mr-2" />
                  Regenerate Key
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600">
                  Revoke Key
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Client Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Client Name:</span>{' '}
                  <span className="font-medium">{apiKey.client_name}</span>
                </div>
                {apiKey.client_organization && (
                  <div>
                    <span className="text-gray-500">Organization:</span>{' '}
                    <span className="font-medium">{apiKey.client_organization}</span>
                  </div>
                )}
                {apiKey.client_contact && (
                  <div>
                    <span className="text-gray-500">Contact:</span>{' '}
                    <span className="font-medium">{apiKey.client_contact}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage Metrics
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Total Requests:</span>{' '}
                  <Badge variant="outline" className="ml-2 font-mono">
                    {apiKey.total_requests.toLocaleString()}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Last Used:</span>{' '}
                  <span className="font-medium">
                    {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Rate Limit:</span>{' '}
                  <span className="font-medium">{formatRateLimit(apiKey.rate_limit)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  📊 Detailed usage analytics coming soon
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions & Scopes
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">Granted Permissions:</span>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.length > 0 ? (
                      apiKey.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline">
                          {permission}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No permissions granted</span>
                    )}
                  </div>
                </div>

                {apiKey.allowed_endpoints && apiKey.allowed_endpoints.length > 0 && (
                  <div className="pt-3 border-t">
                    <span className="text-sm text-gray-500 mb-2 block">Allowed Endpoints:</span>
                    <div className="bg-gray-50 p-3 rounded-md space-y-1">
                      {apiKey.allowed_endpoints.map((endpoint, index) => (
                        <div key={index} className="font-mono text-xs text-gray-700">
                          {endpoint}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
