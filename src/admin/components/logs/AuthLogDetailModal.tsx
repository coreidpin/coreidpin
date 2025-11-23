import React from 'react';
import { Calendar, User, MapPin, Monitor, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { AuthLog } from './AuthLogsTable';

interface AuthLogDetailModalProps {
  log: AuthLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuthLogDetailModal({ log, isOpen, onClose }: AuthLogDetailModalProps) {
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
      case 'suspicious':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspicious
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const eventTypeLabels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    failed_login: 'Failed Login',
    password_reset: 'Password Reset',
    email_verification: 'Email Verification',
    session_expired: 'Session Expired',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">Auth Log Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {eventTypeLabels[log.event_type] || log.event_type}
                </Badge>
                {getStatusBadge(log.status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="event" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="event">Event</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="event" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Event Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Event Type:</span>{' '}
                  <Badge variant="outline">
                    {eventTypeLabels[log.event_type] || log.event_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  {getStatusBadge(log.status)}
                </div>
                <div>
                  <span className="text-gray-500">Timestamp:</span>{' '}
                  <span className="font-medium">{formatDate(log.created_at)}</span>
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
                <span className="text-gray-500">Event occurred at:</span>{' '}
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
                {log.location && (
                  <div>
                    <span className="text-gray-500">Location:</span>{' '}
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.location}
                    </span>
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
                {log.device_fingerprint && (
                  <div>
                    <span className="text-gray-500">Device Fingerprint:</span>{' '}
                    <span className="font-mono text-xs">{log.device_fingerprint}</span>
                  </div>
                )}
              </div>
            </div>

            {log.status !== 'suspicious' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">Admin Actions</p>
                <Button size="sm" variant="outline" className="w-full text-black">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Flag as Suspicious
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
