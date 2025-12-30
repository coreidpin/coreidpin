/**
 * Skills Gap Analysis
 * Compare user's skills against market demand
 */

import React from 'react';
import { TrendingUp, Target, Award, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface Skill {
  name: string;
  level?: string;
  hasSkill: boolean;
}

interface InDemandSkill {
  name: string;
  demand: 'high' | 'medium' | 'low';
  category: string;
  averageSalaryIncrease?: string;
}

interface SkillsGapProps {
  userSkills: string[];
  className?: string;
}

// Market demand data (in real app, fetch from API)
const IN_DEMAND_SKILLS: InDemandSkill[] = [
  { name: 'React', demand: 'high', category: 'Frontend', averageSalaryIncrease: '+15%' },
  { name: 'TypeScript', demand: 'high', category: 'Language', averageSalaryIncrease: '+12%' },
  { name: 'Node.js', demand: 'high', category: 'Backend', averageSalaryIncrease: '+10%' },
  { name: 'Python', demand: 'high', category: 'Language', averageSalaryIncrease: '+18%' },
  { name: 'AWS', demand: 'high', category: 'Cloud', averageSalaryIncrease: '+20%' },
  { name: 'Docker', demand: 'high', category: 'DevOps', averageSalaryIncrease: '+14%' },
  { name: 'Kubernetes', demand: 'high', category: 'DevOps', averageSalaryIncrease: '+16%' },
  { name: 'GraphQL', demand: 'medium', category: 'API', averageSalaryIncrease: '+8%' },
  { name: 'Next.js', demand: 'high', category: 'Frontend', averageSalaryIncrease: '+12%' },
  { name: 'PostgreSQL', demand: 'medium', category: 'Database', averageSalaryIncrease: '+7%' },
  { name: 'MongoDB', demand: 'medium', category: 'Database', averageSalaryIncrease: '+9%' },
  { name: 'Vue.js', demand: 'medium', category: 'Frontend', averageSalaryIncrease: '+10%' },
  { name: 'Angular', demand: 'medium', category: 'Frontend', averageSalaryIncrease: '+9%' },
  { name: 'Terraform', demand: 'high', category: 'DevOps', averageSalaryIncrease: '+15%' },
  { name: 'Go', demand: 'high', category: 'Language', averageSalaryIncrease: '+17%' },
];

export const SkillsGap: React.FC<SkillsGapProps> = ({
  userSkills,
  className,
}) => {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

  // Analyze skills
  const skillsAnalysis = IN_DEMAND_SKILLS.map(skill => ({
    ...skill,
    hasSkill: normalizedUserSkills.some(
      us => us.includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(us)
    ),
  }));

  const matchedSkills = skillsAnalysis.filter(s => s.hasSkill);
  const missingHighDemandSkills = skillsAnalysis.filter(
    s => !s.hasSkill && s.demand === 'high'
  );
  const missingMediumDemandSkills = skillsAnalysis.filter(
    s => !s.hasSkill && s.demand === 'medium'
  );

  const skillMatchPercentage = (matchedSkills.length / IN_DEMAND_SKILLS.length) * 100;

  const getDemandColor = (demand: 'high' | 'medium' | 'low') => {
    switch (demand) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Skills Gap Analysis
        </h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {matchedSkills.length}/{IN_DEMAND_SKILLS.length} In-Demand Skills
        </Badge>
      </div>

      {/* Match Percentage */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Market Alignment</span>
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(skillMatchPercentage)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${skillMatchPercentage}%` }}
          />
        </div>
      </div>

      {/* Your Strengths */}
      {matchedSkills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">Your Strengths</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.slice(0, 8).map((skill, idx) => (
              <Badge
                key={idx}
                className="bg-green-100 text-green-700 border border-green-200"
              >
                {skill.name}
                {skill.averageSalaryIncrease && (
                  <span className="ml-1 text-xs">({skill.averageSalaryIncrease})</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Skills to Learn - High Priority */}
      {missingHighDemandSkills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              High-Priority Skills to Learn
            </h4>
          </div>
          <div className="space-y-2">
            {missingHighDemandSkills.slice(0, 5).map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={getDemandColor(skill.demand)}>
                    {skill.demand.toUpperCase()}
                  </Badge>
                  <div>
                    <div className="font-medium text-gray-900">{skill.name}</div>
                    <div className="text-xs text-gray-600">{skill.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {skill.averageSalaryIncrease && (
                    <span className="text-sm font-medium text-green-600">
                      {skill.averageSalaryIncrease}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills to Learn - Medium Priority */}
      {missingMediumDemandSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-yellow-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              Consider Learning
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingMediumDemandSkills.slice(0, 6).map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-yellow-50 text-yellow-700 border border-yellow-200"
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Perfect Match */}
      {missingHighDemandSkills.length === 0 && missingMediumDemandSkills.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Perfect Skills Alignment!
          </h3>
          <p className="text-sm text-gray-600">
            You have all the in-demand skills. Keep learning to stay ahead!
          </p>
        </div>
      )}
    </div>
  );
};
