/**
 * Portfolio Health Score
 * Calculates and displays overall portfolio quality
 */

import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Progress } from '../ui/progress';

interface HealthMetric {
  name: string;
  score: number;
  weight: number;
  passed: boolean;
  suggestions: string[];
}

interface PortfolioHealthProps {
  metrics: {
    hasProjects: boolean;
    projectCount: number;
    hasFeaturedProjects: boolean;
    hasDescription: boolean;
    hasSkills: boolean;
    skillCount: number;
    hasProfileImage: boolean;
    hasContact: boolean;
    hasLinks: boolean;
    projectsWithImages: number;
    projectsWithDescriptions: number;
  };
  className?: string;
}

export const PortfolioHealth: React.FC<PortfolioHealthProps> = ({
  metrics,
  className,
}) => {
  // Calculate health metrics
  const healthMetrics: HealthMetric[] = [
    {
      name: 'Projects',
      score: Math.min((metrics.projectCount / 3) * 100, 100),
      weight: 25,
      passed: metrics.projectCount >= 3,
      suggestions: metrics.projectCount < 3
        ? [`Add ${3 - metrics.projectCount} more projects to showcase your work`]
        : [],
    },
    {
      name: 'Profile Completeness',
      score:
        ((metrics.hasDescription ? 25 : 0) +
          (metrics.hasProfileImage ? 25 : 0) +
          (metrics.hasContact ? 25 : 0) +
          (metrics.hasLinks ? 25 : 0)),
      weight: 20,
      passed:
        metrics.hasDescription &&
        metrics.hasProfileImage &&
        metrics.hasContact &&
        metrics.hasLinks,
      suggestions: [
        ...(!metrics.hasDescription ? ['Add a professional bio'] : []),
        ...(!metrics.hasProfileImage ? ['Upload a profile picture'] : []),
        ...(!metrics.hasContact ? ['Add contact information'] : []),
        ...(!metrics.hasLinks ? ['Add social/professional links'] : []),
      ],
    },
    {
      name: 'Skills & Expertise',
      score: Math.min((metrics.skillCount / 5) * 100, 100),
      weight: 15,
      passed: metrics.skillCount >= 5,
      suggestions: metrics.skillCount < 5
        ? [`Add ${5 - metrics.skillCount} more skills to highlight your expertise`]
        : [],
    },
    {
      name: 'Featured Content',
      score: metrics.hasFeaturedProjects ? 100 : 0,
      weight: 10,
      passed: metrics.hasFeaturedProjects,
      suggestions: !metrics.hasFeaturedProjects
        ? ['Mark your best projects as featured']
        : [],
    },
    {
      name: 'Project Quality',
      score:
        metrics.projectCount > 0
          ? ((metrics.projectsWithImages + metrics.projectsWithDescriptions) /
              (metrics.projectCount * 2)) *
            100
          : 0,
      weight: 30,
      passed:
        metrics.projectCount > 0 &&
        metrics.projectsWithImages >= metrics.projectCount * 0.8 &&
        metrics.projectsWithDescriptions >= metrics.projectCount * 0.8,
      suggestions: [
        ...(metrics.projectsWithImages < metrics.projectCount
          ? ['Add images to all projects']
          : []),
        ...(metrics.projectsWithDescriptions < metrics.projectCount
          ? ['Add detailed descriptions to all projects']
          : []),
      ],
    },
  ];

  // Calculate overall score
  const overallScore = healthMetrics.reduce(
    (acc, metric) => acc + (metric.score * metric.weight) / 100,
    0
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const allSuggestions = healthMetrics.flatMap((m) => m.suggestions);

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Portfolio Health</span>
        </h3>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Score</span>
          <span className={cn('text-2xl font-bold', getScoreColor(overallScore))}>
            {Math.round(overallScore)}/100
          </span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500',
              getScoreBgColor(overallScore)
            )}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className={cn('text-sm font-medium', getScoreColor(overallScore))}>
            {getScoreLabel(overallScore)}
          </span>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-4 mb-6">
        {healthMetrics.map((metric, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metric.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {metric.name}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(metric.score)}%
              </span>
            </div>
            <Progress value={metric.score} className="h-2" />
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {allSuggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <h4 className="text-sm font-semibold text-blue-900">
              Recommendations to Improve
            </h4>
          </div>
          <ul className="space-y-1 ml-6">
            {allSuggestions.slice(0, 5).map((suggestion, idx) => (
              <li key={idx} className="text-sm text-blue-700">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
