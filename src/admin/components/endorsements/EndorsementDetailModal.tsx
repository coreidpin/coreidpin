import React from 'react';
import { X, User, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Endorsement } from './EndorsementsTable';

interface EndorsementDetailModalProps {
  endorsement: Endorsement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EndorsementDetailModal({ endorsement, isOpen, onClose }: EndorsementDetailModalProps) {
  if (!endorsement) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending Verification
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">Endorsement Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {endorsement.skill_name}
                </Badge>
                {getStatusBadge(endorsement.verification_status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="endorsee">Endorsee</TabsTrigger>
            <TabsTrigger value="endorser">Endorser</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Skill/Competency</h3>
              <Badge variant="outline" className="text-base px-3 py-1">
                {endorsement.skill_name}
              </Badge>
            </div>

            {endorsement.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-600">{endorsement.description}</p>
              </div>
            )}

            {endorsement.relationship && (
              <div>
                <h3 className="font-semibold mb-2">Professional Relationship</h3>
                <p className="text-sm text-gray-600">{endorsement.relationship}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  {formatDate(endorsement.created_at)}
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  {formatDate(endorsement.updated_at)}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endorsee" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Endorsee Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-medium">{endorsement.endorsee_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{' '}
                  <span className="font-medium">{endorsement.endorsee_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>{' '}
                  <span className="font-mono text-xs">{endorsement.endorsee_id}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View Endorsee Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="endorser" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Endorser Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-medium">{endorsement.endorser_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{' '}
                  <span className="font-medium">{endorsement.endorser_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>{' '}
                  <span className="font-mono text-xs">{endorsement.endorser_id}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View Endorser Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge(endorsement.verification_status)}
                </div>

                {endorsement.verification_notes && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-semibold mb-1">Admin Notes</h4>
                    <p className="text-sm text-gray-600">{endorsement.verification_notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-3">Admin Actions</p>
                  <div className="space-y-2">
                    {endorsement.verification_status === 'pending' && (
                      <Button size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Endorsement
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Flag
                      </Button>
                      {endorsement.verification_status !== 'rejected' && (
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Endorsement Metadata</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Endorsement ID:</span>{' '}
                  <span className="font-mono text-xs">{endorsement.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  {formatDate(endorsement.created_at)}
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  {formatDate(endorsement.updated_at)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
