import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Calendar } from 'lucide-react';
import { getUserAchievements, getAllAchievements, type Achievement, type UserAchievement } from '../../lib/api/github-profile-features';

interface PublicAchievementsProps {
  userId: string;
}

export const PublicAchievements: React.FC<PublicAchievementsProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Load earned and all achievements in parallel
      const [earned, all] = await Promise.all([
        getUserAchievements(userId),
        getAllAchievements()
      ]);

      setEarnedAchievements(earned);
      setAllAchievements(all);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
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
      case 'common': return 'border-gray-200';
      default: return 'border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Only show earned achievements on public profile
  const displayAchievements = allAchievements.filter(a => isEarned(a.id));

  if (displayAchievements.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <Card className="border-dashed border-gray-200">
          <CardContent className="p-8 text-center">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No achievements earned yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">
          Achievements 
          <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {displayAchievements.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayAchievements.map((achievement) => {
          const earnedDate = getEarnedDate(achievement.id);

          return (
            <Card
              key={achievement.id}
              className={`relative overflow-hidden border ${getRarityBorder(achievement.rarity)} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4 flex flex-col items-center text-center h-full">
                {/* Rarity Badge - Mini */}
                <div className="absolute top-1 right-1">
                 {/* Optional: could show small dot or indicator */}
                </div>

                {/* Icon */}
                <div className="text-3xl mb-2">
                  {achievement.icon}
                </div>

                {/* Name */}
                <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
                  {achievement.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {achievement.description}
                </p>

                {/* Date Earned */}
                {earnedDate && (
                  <div className="mt-auto pt-2 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(earnedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {/* Rarity Label Bottom */}
                <Badge variant="outline" className={`mt-2 text-[10px] py-0 h-4 border-0 ${getRarityColor(achievement.rarity)}`}>
                   {achievement.rarity}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
