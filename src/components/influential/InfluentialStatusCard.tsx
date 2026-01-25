import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Eye, ChevronRight, Sparkles, Zap, Crown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { InfluentialBadge } from './InfluentialBadge';
import type { InfluentialProfessional } from '../../types/influential';
import { INFLUENTIAL_CATEGORY_LABELS } from '../../types/influential';

interface InfluentialStatusCardProps {
  influentialStatus: InfluentialProfessional | null;
  isInfluential: boolean;
  onManageProjects?: () => void;
  onViewDirectory?: () => void;
}

export function InfluentialStatusCard({ 
  influentialStatus, 
  isInfluential,
  onManageProjects,
  onViewDirectory 
}: InfluentialStatusCardProps) {
  
  // Influential User View (High Visibility)
  if (isInfluential && influentialStatus) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="!bg-[#0f172a] border-emerald-500/30 overflow-hidden shadow-xl" style={{ backgroundColor: '#0f172a' }}>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
            {/* Identity Group */}
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                <Crown className="h-6 w-6" style={{ color: '#34D399' }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 style={{ color: '#FFFFFF' }} className="text-lg font-bold truncate">Influential Status</h3>
                  <InfluentialBadge variant="compact" size="sm" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {influentialStatus.categories?.slice(0, 2).map((cat) => (
                    <span key={cat} style={{ color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.2)' }} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border">
                      {INFLUENTIAL_CATEGORY_LABELS[cat]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Group */}
            <div className="flex items-center gap-6 px-6 border-x border-white/10">
              <div className="text-center">
                <p style={{ color: '#94A3B8' }} className="text-[10px] uppercase tracking-widest font-bold mb-1">Score</p>
                <div className="flex items-baseline gap-1">
                  <span style={{ color: '#34D399' }} className="text-2xl font-bold">{influentialStatus.influence_score || 0}</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-xs">/100</span>
                </div>
              </div>
              <div className="w-24">
                <Progress 
                  value={influentialStatus.influence_score || 0} 
                  className="h-1.5 bg-white/10"
                />
              </div>
              <div className="text-right hidden sm:block">
                <p style={{ color: '#94A3B8' }} className="text-[10px] uppercase tracking-widest font-bold mb-1">Rank</p>
                <p style={{ color: '#FFFFFF' }} className="text-sm font-bold">Top 5%</p>
              </div>
            </div>

            {/* Actions Group */}
            <div className="flex gap-2">
              <Button
                onClick={onManageProjects}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 !text-slate-900 font-bold h-9"
              >
                <Award className="h-4 w-4 mr-2" style={{ color: '#0F172A' }} />
                Projects
              </Button>
              <Button
                onClick={onViewDirectory}
                variant="outline"
                size="icon"
                className="border-white/20 !text-white hover:bg-white/10 h-9 w-9"
              >
                <Eye className="h-4 w-4" style={{ color: '#FFFFFF' }} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Non-Influential User View (High Visibility Compact)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="!bg-[#0f172a] border-emerald-500/20 overflow-hidden shadow-lg" style={{ backgroundColor: '#0f172a' }}>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <Crown className="h-4 w-4" style={{ color: '#34D399' }} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '16px' }} className="font-bold mb-0.5">Join the Influential Network</h3>
              <p style={{ color: '#e2e8f0', fontSize: '12px' }} className="font-medium">Curated community for high-impact professionals</p>
            </div>
          </div>

          {/* Benefits - Force visibility with inline styles */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-2 py-1 px-6 md:border-x border-white/10">
            <div className="flex items-center gap-2 group">
              <Star className="h-3 w-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span style={{ color: '#ffffff', fontSize: '11px' }} className="font-medium flex-shrink-0">Exclusive Badge</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Award className="h-3 w-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span style={{ color: '#ffffff', fontSize: '11px' }} className="font-medium flex-shrink-0">Showcase Work</span>
            </div>
            <div className="flex items-center gap-2 group hidden sm:flex">
              <Eye className="h-3 w-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span style={{ color: '#ffffff', fontSize: '11px' }} className="font-medium flex-shrink-0">Elite Directory</span>
            </div>
          </div>

          {/* CTA Group */}
          <div className="flex items-center gap-3">
            <div style={{ color: '#FFFFFF', backgroundColor: 'rgba(52, 211, 153, 0.2)', borderColor: 'rgba(52, 211, 153, 0.3)' }} className="hidden xl:flex items-center gap-2 text-[10px] font-bold py-1 px-2.5 rounded border">
              <Sparkles className="h-3 w-3" style={{ color: '#34D399' }} />
              <span>Invitation Only</span>
            </div>
            <Button
              onClick={onViewDirectory}
              size="sm"
              variant="outline"
              className="border-emerald-500/40 !text-emerald-400 hover:bg-emerald-500/10 h-8 font-bold text-xs px-4 bg-transparent transition-all"
            >
              Explore Network
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

