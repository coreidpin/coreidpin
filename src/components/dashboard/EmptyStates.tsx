import React from 'react';
import { FolderOpen, Star, Activity, Search, Wifi, AlertCircle } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

// No Projects
export const NoProjects: React.FC<{ onAddProject: () => void }> = ({ onAddProject }) => (
  <EmptyState
    icon={FolderOpen}
    title="No projects yet"
    description="Showcase your work by adding your first project. Projects help employers understand your experience and skills."
    actionLabel="Add Your First Project"
    onAction={onAddProject}
    iconClassName="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
  />
);

// No Endorsements
export const NoEndorsements: React.FC<{ onRequestEndorsement: () => void }> = ({ onRequestEndorsement }) => (
  <EmptyState
    icon={Star}
    title="No endorsements yet"
    description="Build credibility by requesting endorsements from colleagues, clients, or supervisors who can vouch for your skills."
    actionLabel="Request Endorsement"
    onAction={onRequestEndorsement}
    iconClassName="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
  />
);

// No Activity
export const NoActivity: React.FC = () => (
  <EmptyState
    icon={Activity}
    title="No recent activity"
    description="Your activity timeline will show profile updates, endorsements received, and other important events."
    size="sm"
    iconClassName="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
  />
);

// Search No Results
export const NoSearchResults: React.FC<{ searchTerm: string; onClear: () => void }> = ({ searchTerm, onClear }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search or filters.`}
    actionLabel="Clear Search"
    onAction={onClear}
    size="sm"
    iconClassName="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
  />
);

// Offline State
export const OfflineState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Wifi}
    title="You're offline"
    description="Check your internet connection and try again. Some features may not be available offline."
    actionLabel="Retry"
    onAction={onRetry}
    iconClassName="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
  />
);

// Error State
export const ErrorState: React.FC<{ message?: string; onRetry: () => void }> = ({ 
  message = "Something went wrong while loading this content.",
  onRetry 
}) => (
  <EmptyState
    icon={AlertCircle}
    title="Oops! Something went wrong"
    description={message}
    actionLabel="Try Again"
    onAction={onRetry}
    iconClassName="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
  />
);
