import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Lock, Calendar, ShieldCheck, Ruler, Users, Pin, Briefcase, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { getUserAchievements, getAllAchievements, checkAndUnlockAchievements, type Achievement, type UserAchievement } from '../../lib/api/github-profile-features';

const ICON_MAP: Record<string, React.ReactNode> = {
  'shield-check': <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-green-600" />,
  'pencil-ruler': <Ruler className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />,
  'users': <Users className="w-8 h-8 md:w-12 md:h-12 text-purple-600" />,
  'pin': <Pin className="w-8 h-8 md:w-12 md:h-12 text-orange-600" />,
  'briefcase': <Briefcase className="w-8 h-8 md:w-12 md:h-12 text-indigo-600" />,
  'rocket': <Rocket className="w-8 h-8 md:w-12 md:h-12 text-red-600" />,
  'default': <Trophy className="w-8 h-8 md:w-12 md:h-12 text-yellow-600" />
};

export const AchievementsDisplay: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Load earned and all achievements in parallel
      const [earned, all] = await Promise.all([
        getUserAchievements(user.id),
        getAllAchievements()
      ]);

      setEarnedAchievements(earned);
      setAllAchievements(all);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAchievements = async () => {
    if (!userId) return;

    try {
      // Optimistic check - maybe show loading toast?
      const toastId = toast.loading('Checking for new achievements...');
      const newlyUnlocked = await checkAndUnlockAchievements(userId);
      toast.dismiss(toastId);
      
      if (newlyUnlocked.length > 0) {
        toast.success(`Unlocked ${newlyUnlocked.length} new achievement${newlyUnlocked.length > 1 ? 's' : ''}!`);
        loadAchievements(); // Reload to show new achievements
      } else {
        toast.info('No new achievements unlocked yet. Keep going!');
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
      toast.error('Failed to check for new achievements');
    }
  };

  const isEarned = (achievementId: string) => {
    return earnedAchievements.some(ea => ea.id === achievementId);
  };

  const getEarnedDate = (achievementId: string) => {
    const earned = earnedAchievements.find(ea => ea.id === achievementId);
    return earned?.earned_at;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-500';
      case 'rare': return 'border-blue-500';
      case 'common': return 'border-gray-300';
      default: return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentage safely
  const total = allAchievements.length;
  const earnedCount = earnedAchievements.length;
  const progress = total > 0 ? (earnedCount / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <CardTitle>Achievements</CardTitle>
            </div>
            <button
              onClick={handleCheckAchievements}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Check for new achievements
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {earnedAchievements.length}
              </div>
              <div className="text-sm text-gray-600">Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-400">
                {allAchievements.length - earnedAchievements.length}
              </div>
              <div className="text-sm text-gray-600">Locked</div>
            </div>
            <div className="ml-auto">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full w-32 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAchievements.map((achievement) => {
          const earned = isEarned(achievement.id);
          const earnedDate = getEarnedDate(achievement.id);
          const IconComponent = ICON_MAP[achievement.icon] || ICON_MAP['default'];

          return (
            <Card
              key={achievement.id}
              className={`relative overflow-hidden border-2 transition-all ${
                earned ? getRarityBorder(achievement.rarity) + ' shadow-md' : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <CardContent className="p-6">
                {/* Rarity Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </Badge>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center mb-4 min-h-[60px]">
                  <div className={`transition-all duration-500 ${!earned ? 'grayscale opacity-30 scale-90' : 'scale-110 drop-shadow-sm'}`}>
                    {earned ? (
                        IconComponent
                    ) : (
                        <div className="relative">
                            {IconComponent}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-gray-500/80 drop-shadow-md" />
                            </div>
                        </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className={`text-lg font-bold text-center mb-2 ${
                  earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </h3>

                {/* Description */}
                <p className={`text-sm text-center mb-4 ${
                  earned ? 'text-gray-600' : 'text-gray-400 italic'
                }`}>
                  {achievement.description}
                </p>

                {/* Date Earned */}
                {earned && earnedDate && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Earned {new Date(earnedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}

                {/* Locked State (Helper text) */}
                {!earned && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {allAchievements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No achievements yet
            </h3>
            <p className="text-gray-600">
              Run the seed script or manually insert achievements to see them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
