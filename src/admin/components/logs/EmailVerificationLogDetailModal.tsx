import React from 'react';
import { Calendar, User, Shield, Mail, Link2, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { EmailVerificationLog } from './EmailVerificationLogsTable';

interface EmailVerificationLogDetailModalProps {
  log: EmailVerificationLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailVerificationLogDetailModal({ log, isOpen, onClose }: EmailVerificationLogDetailModalProps) {
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
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getTokenStatusBadge = (tokenStatus: string) => {
    switch (tokenStatus) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>;
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
              <DialogTitle className="text-2xl mb-2">Email Verification Log Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  Email Verification
                </Badge>
                {getStatusBadge(log.status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="link">Link Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Verification Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  {getStatusBadge(log.status)}
                </div>
                <div>
                  <span className="text-gray-500">Created At:</span>{' '}
                  <span className="font-medium">{formatDate(log.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Token Status:</span>{' '}
                  {getTokenStatusBadge(log.token_status)}
                </div>
                <div>
                  <span className="text-gray-500">Expires At:</span>{' '}
                  <span className="font-medium">{formatDate(log.expires_at)}</span>
                </div>
                {log.verified_at && (
                  <div>
                    <span className="text-gray-500">Verified At:</span>{' '}
                    <span className="font-medium">{formatDate(log.verified_at)}</span>
                  </div>
                )}
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
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Link sent:</span>{' '}
                  <span className="font-medium">{formatDate(log.link_sent_at)}</span>
                </div>
                {log.link_clicked_at && (
                  <div>
                    <span className="text-gray-500">Link clicked:</span>{' '}
                    <span className="font-medium">{formatDate(log.link_clicked_at)}</span>
                  </div>
                )}
                {log.verified_at && (
                  <div>
                    <span className="text-gray-500">Verified:</span>{' '}
                    <span className="font-medium">{formatDate(log.verified_at)}</span>
                  </div>
                )}
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
                  <span className="font-medium flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {log.user_email}
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

          <TabsContent value="link" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Verification Link Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Token:</span>{' '}
                  <div className="bg-gray-50 p-2 rounded mt-1 font-mono text-xs break-all">
                    {log.token}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Link Sent At:</span>{' '}
                  <span className="font-medium">{formatDate(log.link_sent_at)}</span>
                </div>
                {log.link_clicked_at ? (
                  <div>
                    <span className="text-gray-500">Link Clicked At:</span>{' '}
                    <span className="font-medium">{formatDate(log.link_clicked_at)}</span>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800">Link has not been clicked yet</p>
                  </div>
                )}
              </div>
            </div>

            {(log.status === 'pending' || log.status === 'expired') && (
              <div className="pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full text-black">
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Information
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
              </div>
            </div>

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
