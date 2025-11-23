import React from 'react';
import { Calendar, User, MapPin, Monitor, Shield, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { PINLoginLog } from './PINLoginLogsTable';

interface PINLoginLogDetailModalProps {
  log: PINLoginLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PINLoginLogDetailModal({ log, isOpen, onClose }: PINLoginLogDetailModalProps) {
  if (!log) return null;

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
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Shield className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">PIN Login Log Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  PIN Login
                </Badge>
                {getStatusBadge(log.status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="login">Login Details</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Login Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  {getStatusBadge(log.status)}
                </div>
                <div>
                  <span className="text-gray-500">Timestamp:</span>{' '}
                  <span className="font-medium">{formatDate(log.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Attempt Count:</span>{' '}
                  <Badge variant="outline" className="font-mono ml-2">
                    {log.attempt_count}
                  </Badge>
                  {log.attempt_count > 3 && (
                    <span className="text-xs text-orange-600 ml-2">⚠️ High attempts</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">PIN Sent:</span>{' '}
                  {log.pin_sent ? (
                    <Badge className="bg-green-100 text-green-800 ml-2">Yes</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 ml-2">No</Badge>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">PIN Verified:</span>{' '}
                  {log.pin_verified ? (
                    <Badge className="bg-green-100 text-green-800 ml-2">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 ml-2">No</Badge>
                  )}
                </div>
              </div>
            </div>

            {log.error_message && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <h4 className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Error Message
                </h4>
                <p className="text-sm text-red-700">{log.error_message}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="text-sm">
                <span className="text-gray-500">Login attempted at:</span>{' '}
                <span className="font-medium">{formatDate(log.created_at)}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>{' '}
                  <span className="font-medium">{log.user_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone Number:</span>{' '}
                  <span className="font-medium flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {log.phone_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>{' '}
                  <span className="font-mono text-xs">{log.user_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full text-black">
                View User Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="session" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Session Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">IP Address:</span>{' '}
                  <span className="font-mono">{log.ip_address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">User Agent:</span>{' '}
                  <div className="bg-gray-50 p-2 rounded mt-1 font-mono text-xs break-all">
                    {log.user_agent || 'N/A'}
                  </div>
                </div>
                {log.device_info && (
                  <div>
                    <span className="text-gray-500">Device Info:</span>{' '}
                    <div className="bg-gray-50 p-2 rounded mt-1 text-xs">
                      {log.device_info}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  {getStatusBadge(log.status)}
                </div>
                {log.status === 'blocked' && log.blocked_until && (
                  <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                    <h4 className="text-sm font-semibold text-orange-800 mb-1">
                      Account Blocked
                    </h4>
                    <p className="text-sm text-orange-700">
                      Blocked until: {formatDate(log.blocked_until)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {log.status === 'blocked' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">Admin Actions</p>
                <Button size="sm" variant="outline" className="w-full text-black">
                  <Shield className="h-4 w-4 mr-2" />
                  Unblock User
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Log Metadata</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Log ID:</span>{' '}
                  <span className="font-mono text-xs">{log.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  {formatDate(log.created_at)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
