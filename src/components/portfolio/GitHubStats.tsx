/**
 * GitHub Stats Widget
 * Displays repository statistics fetched from GitHub API
 */

import React, { useEffect, useState } from 'react';
import { Star, GitFork, Eye, AlertCircle, Github } from 'lucide-react';
import { fetchGitHubRepoStats, type GitHubRepoStats } from '../../utils/github-api';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface GitHubStatsProps {
  repoUrl: string;
  className?: string;
  compact?: boolean;
}

export const GitHubStats: React.FC<GitHubStatsProps> = ({
  repoUrl,
  className,
  compact = false,
}) => {
  const [stats, setStats] = useState<GitHubRepoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(false);
      
      const data = await fetchGitHubRepoStats(repoUrl);
      
      if (data) {
        setStats(data);
      } else {
        setError(true);
      }
      
      setLoading(false);
    };

    if (repoUrl) {
      loadStats();
    }
  }, [repoUrl]);

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-gray-100 rounded-lg p-4', className)}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn('bg-gray-50 border border-gray-200 rounded-lg p-4', className)}>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Unable to fetch GitHub stats</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Star className="h-4 w-4" />
          <span>{stats.stars}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <GitFork className="h-4 w-4" />
          <span>{stats.forks}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <AlertCircle className="h-4 w-4" />
          <span>{stats.openIssues}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Repository Stats</h3>
        </div>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View on GitHub →
        </a>
      </div>

      {/* Description */}
      {stats.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {stats.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
          <Star className="h-4 w-4 text-yellow-600" />
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.stars}</div>
            <div className="text-xs text-gray-600">Stars</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <GitFork className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.forks}</div>
            <div className="text-xs text-gray-600">Forks</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <Eye className="h-4 w-4 text-green-600" />
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.watchers}</div>
            <div className="text-xs text-gray-600">Watchers</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.openIssues}</div>
            <div className="text-xs text-gray-600">Issues</div>
          </div>
        </div>
      </div>

      {/* Language & Topics */}
      <div className="flex flex-wrap items-center gap-2">
        {stats.language && (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {stats.language}
          </Badge>
        )}
        {stats.topics.slice(0, 3).map((topic, idx) => (
          <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700">
            {topic}
          </Badge>
        ))}
        {stats.topics.length > 3 && (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            +{stats.topics.length - 3}
          </Badge>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
