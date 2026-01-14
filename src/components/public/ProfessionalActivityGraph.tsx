import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Info } from 'lucide-react';
import { getActivityTimeline, type ActivityDay } from '../../lib/api/github-profile-features';
import { supabase } from '../../utils/supabase/client';

interface ProfessionalActivityGraphProps {
  activityData?: ActivityDay[];
  userName: string;
  userId?: string;
}

export const ProfessionalActivityGraph: React.FC<ProfessionalActivityGraphProps> = ({
  activityData: providedData,
  userName,
  userId: providedUserId
}) => {
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch activity data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use provided data if available
        if (providedData && providedData.length > 0) {
          setActivityData(providedData);
          setLoading(false);
          return;
        }

        // Otherwise try to fetch from database
        let userIdToUse = providedUserId;
        
        if (!userIdToUse) {
          const { data: { user } } = await supabase.auth.getUser();
          userIdToUse = user?.id;
        }

        if (userIdToUse) {
          const data = await getActivityTimeline(userIdToUse);
          if (data && data.length > 0) {
            setActivityData(data);
          } else {
            // Use mock data if no real data
            setActivityData(generateMockDataFlat());
          }
        } else {
          // Fall back to mock data if no user
          setActivityData(generateMockDataFlat());
        }
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
        // Use mock data on error
        setActivityData(generateMockDataFlat());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [providedUserId, providedData]);

  // Generate mock data as flat array for demonstration
  const generateMockDataFlat = (): ActivityDay[] => {
    const days: ActivityDay[] = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random activity with bias towards recent dates
      const intensity = Math.random() * (i < 90 ? 1 : 0.6);
      const count = intensity > 0.15 ? Math.floor(intensity * 15) : 0;
      
      days.push({
        date: date.toISOString().split('T')[0],
        count,
        types: {
          verification: count > 8 ? Math.floor(count * 0.3) : 0,
          engagement: Math.floor(count * 0.4),
          content: Math.floor(count * 0.2),
          achievement: count > 10 ? Math.floor(count * 0.1) : 0
        }
      });
    }
    
    return days;
  };

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'verification' | 'achievement' | 'engagement'>('all');

  // Convert flat activity data to week format for display
  const convertToWeeks = (flatData: ActivityDay[]): ActivityDay[][] => {
    const weeks: ActivityDay[][] = [];
    const sortedData = [...flatData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group into weeks (7 days each)
    for (let i = 0; i < sortedData.length; i += 7) {
      weeks.push(sortedData.slice(i, i + 7));
    }

    // Ensure we have exactly 52 weeks
    while (weeks.length < 52) {
      weeks.unshift([]);
    }
    if (weeks.length > 52) {
      weeks.splice(0, weeks.length - 52);
    }

    return weeks;
  };

  const weeks = convertToWeeks(activityData);
  
  // Calculate total based on filter
  const totalContributions = activityData.reduce((sum, day) => {
    if (filterType === 'all') return sum + day.count;
    const types = day.types as any;
    return sum + (types[filterType] || 0);
  }, 0);

  // Color logic based on activity type priority
  const getColorForActivity = (day?: ActivityDay): string => {
    if (!day || day.count === 0) return 'bg-gray-100 dark:bg-gray-800';
    
    // If filtering, only show relevant intensity
    if (filterType !== 'all') {
      const types = day.types as any;
      const count = types[filterType] || 0;
      
      if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
      
      if (filterType === 'verification') {
        if (count > 2) return 'bg-green-500';
        return 'bg-green-300';
      }
      if (filterType === 'achievement') {
        if (count > 0) return 'bg-purple-500';
        return 'bg-purple-300';
      }
      if (filterType === 'engagement') {
        if (count > 2) return 'bg-blue-500';
        return 'bg-blue-300';
      }
    }
    
    // Default "All" view (Priority Logic)
    const types = day.types || {};
    
    // Priority: Verification > Achievement > Engagement > Content
    if ((types as any).verification && (types as any).verification > 0) {
      if (day.count > 10) return 'bg-green-500'; // Bright green
      if (day.count > 5) return 'bg-green-400';  // Medium green
      return 'bg-green-300';                     // Light green
    }
    
    if ((types as any).achievement && (types as any).achievement > 0) {
      if (day.count > 8) return 'bg-purple-500';  // Bright purple
      return 'bg-purple-400';                     // Purple
    }
    
    if ((types as any).engagement && (types as any).engagement > 0) {
      if (day.count > 6) return 'bg-blue-500';  // Bright blue
      return 'bg-blue-400';                     // Blue
    }
    
    // Content updates (yellow)
    if (day.count > 4) return 'bg-yellow-400';
    return 'bg-yellow-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActivityLabel = (count: number) => {
    if (count === 0) return 'No activity';
    if (count === 1) return '1 activity';
    return `${count} activities`;
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-base font-semibold text-gray-900">
            {totalContributions.toLocaleString()} {filterType === 'all' ? 'activities' : filterType} in the last year
          </h2>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => setFilterType('all')}
               className={`text-xs px-3 py-1 rounded-md transition-all ${filterType === 'all' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
             >
               All
             </button>
             <button 
               onClick={() => setFilterType('verification')}
               className={`text-xs px-3 py-1 rounded-md transition-all ${filterType === 'verification' ? 'bg-white shadow text-green-700 font-medium' : 'text-gray-500 hover:text-green-600'}`}
             >
               Verifications
             </button>
             <button 
               onClick={() => setFilterType('achievement')}
               className={`text-xs px-3 py-1 rounded-md transition-all ${filterType === 'achievement' ? 'bg-white shadow text-purple-700 font-medium' : 'text-gray-500 hover:text-purple-600'}`}
             >
               Achievements
             </button>
          </div>
        </div>

        {/* Graph Container */}
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-1 min-w-full">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week[dayIndex];
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-[11px] h-[11px] rounded-sm ${getColorForActivity(day)} hover:ring-2 hover:ring-gray-400 cursor-pointer transition-all`}
                        onMouseEnter={(e) => {
                          if (day) {
                            setHoveredDay(day);
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredPosition({ x: rect.left, y: rect.top });
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-xl text-xs pointer-events-none"
              style={{
                left: `${hoveredPosition.x}px`,
                top: `${hoveredPosition.y - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-semibold mb-1">
                {getActivityLabel(hoveredDay.count)} on {formatDate(hoveredDay.date)}
              </div>
              {hoveredDay.count > 0 && hoveredDay.types && (
                <div className="text-gray-300 space-y-0.5">
                  {(filterType === 'all' || filterType === 'verification') && (hoveredDay.types as any).verification > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span>{(hoveredDay.types as any).verification} verification{(hoveredDay.types as any).verification !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {(filterType === 'all' || filterType === 'achievement') && (hoveredDay.types as any).achievement > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>{(hoveredDay.types as any).achievement} achievement{(hoveredDay.types as any).achievement !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {(filterType === 'all' || filterType === 'engagement') && (hoveredDay.types as any).engagement > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>{(hoveredDay.types as any).engagement} engagement{(hoveredDay.types as any).engagement !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {filterType === 'all' && (hoveredDay.types as any).content > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span>{(hoveredDay.types as any).content} update{(hoveredDay.types as any).content !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        {filterType === 'all' && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span>Verifications</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <span>Achievements</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span>Engagements</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span>Updates</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
