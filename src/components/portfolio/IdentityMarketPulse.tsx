import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  TrendingUp, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Radar,
  ChevronRight,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';

interface IdentityMarketPulseProps {
  stats?: {
    demandScore?: number;
    percentileRank?: number;
    geoPings?: any[];
    industryTrends?: any[];
  }
}

export const IdentityMarketPulse: React.FC<IdentityMarketPulseProps> = ({ stats }) => {
  const demandScore = stats?.demandScore || 0;
  
  const pings = stats?.geoPings && stats.geoPings.length > 0 
    ? stats.geoPings.map((p: any) => ({
        id: p.id,
        region: p.region,
        industry: p.industry,
        tier: p.tier as any,
        timestamp: new Date(p.event_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago',
        type: p.type as any
      }))
    : [];

  const industries = stats?.industryTrends && stats.industryTrends.length > 0
    ? stats.industryTrends.map((t: any, idx: number) => ({
        name: t.industry,
        count: parseInt(t.count),
        growth: t.growth >= 0 ? `+${Math.round(t.growth)}%` : `${Math.round(t.growth)}%`,
        color: ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500'][idx % 5]
      }))
    : [];

  const demandLabel = demandScore >= 8 ? 'Very High' : demandScore >= 5 ? 'Strong' : 'Steady';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Radar className="h-6 w-6 text-blue-600 animate-pulse" />
            Market Pulse
          </h2>
          <p className="text-slate-500 text-sm mt-1">Real-time demand analytics for your professional identity</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Demand Index: {demandLabel} ({demandScore})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Map / Geographic Interest */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-400" />
                Geographic Interest
              </CardTitle>
              <Badge variant="outline" className="bg-slate-50">GlobalReach™</Badge>
            </div>
            <CardDescription>Regions actively verifying your GidiPIN</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[240px] w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
              {/* Pulse Effect */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-700" />
              </div>
              
              <div className="relative w-full px-4 space-y-4">
                {pings.length > 0 ? pings.slice(0, 3).map((ping, idx) => (
                  <motion.div 
                    key={ping.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ping.region}</p>
                        <p className="text-xs text-slate-500">{ping.industry} • {ping.tier}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-400">{ping.timestamp}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-green-600">Active</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12">
                     <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                     <p className="text-sm text-slate-400">Waiting for your first geographic ping...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Trends */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-400" />
              Industry Trends
            </CardTitle>
            <CardDescription>Trending sectors for your skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {industries.length > 0 ? industries.map((industry) => (
                <div key={industry.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{industry.name}</span>
                    <span className="text-blue-600 font-bold">{industry.growth}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((industry.count / (industries[0]?.count || 1)) * 100, 100)}%` }}
                      className={`h-full ${industry.color}`}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No industry trends detected yet</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Recommendation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {industries.length > 0 
                    ? `High demand detected in ${industries[0].name}. Keeping your skills updated in this sector could boost visibility by 24%.`
                    : "As you get more verifications, we'll provide tailored recommendations to boost your market value."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Insights Feed */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Verification Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
              View History
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <CardDescription>Recent professional entities who verified your GidiPIN identity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pings.length > 0 ? pings.map((ping) => (
              <div key={ping.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    {ping.tier === 'Tier 1' ? <Zap className="h-5 w-5 text-amber-500" /> : <Building2 className="h-5 w-5 text-slate-400" />}
                  </div>
                  <Badge className={ping.tier === 'Tier 1' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                    {ping.tier}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">{ping.industry} Entity</h4>
                <p className="text-xs text-slate-500 mt-0.5">{ping.region}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{ping.type}</span>
                  <span className="text-[10px] font-medium text-slate-400">{ping.timestamp}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Your verification history is empty. Share your PIN to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Internal Button component since we are using Lucide and standard Tailwind
const Button = ({ children, variant, size, className, onClick }: any) => {
  const variants = {
    ghost: "bg-transparent hover:bg-slate-100",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  return (
    <button 
      onClick={onClick}
      className={`rounded-md transition-colors flex items-center justify-center ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
    >
      {children}
    </button>
  );
};
