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
import { MoreHorizontal, Eye, CheckCircle, XCircle, Flag, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export interface Endorsement {
  id: string;
  endorsee_id: string;
  endorser_id: string;
  skill_name: string;
  description?: string;
  relationship?: string;
  is_verified: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected' | 'flagged';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  endorsee_name?: string;
  endorsee_email?: string;
  endorser_name?: string;
  endorser_email?: string;
}

interface EndorsementsTableProps {
  endorsements: Endorsement[];
  isLoading: boolean;
  onViewEndorsement: (endorsement: Endorsement) => void;
}

export function EndorsementsTable({ endorsements, isLoading, onViewEndorsement }: EndorsementsTableProps) {
  if (isLoading) {
    return <div className="text-center py-10">Loading endorsements...</div>;
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endorsee</TableHead>
            <TableHead>Endorser</TableHead>
            <TableHead>Skill</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endorsements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                No endorsements found.
              </TableCell>
            </TableRow>
          ) : (
            endorsements.map((endorsement) => (
              <TableRow key={endorsement.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {endorsement.endorsee_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {endorsement.endorsee_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {endorsement.endorser_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {endorsement.endorser_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {endorsement.skill_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {endorsement.relationship || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(endorsement.verification_status)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(endorsement.created_at).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => onViewEndorsement(endorsement)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {endorsement.verification_status === 'pending' && (
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Endorsement
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-orange-600">
                        <Flag className="mr-2 h-4 w-4" />
                        Flag for Review
                      </DropdownMenuItem>
                      {endorsement.verification_status !== 'rejected' && (
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
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
