import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface DayActivity {
  date: string; // "2025-01-15"
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Activity intensity level
}

interface ActivityHeatmapProps {
  data: DayActivity[];
  onDayClick?: (day: DayActivity) => void;
}

const COLORS = {
  0: '#ebedf0', // None
  1: '#9be9a8', // Light
  2: '#40c463', // Medium
  3: '#30a14e', // High
  4: '#216e39', // Very High
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  data,
  onDayClick 
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate rolling 365-day grid (last year from today)
  const yearData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // 365 days including today
    
    const days: DayActivity[] = [];
    const dataMap = new Map(data.map(d => [d.date, d]));
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dataMap.get(dateStr);
      
      days.push({
        date: dateStr,
        count: dayData?.count || 0,
        level: dayData?.level || 0
      });
    }
    
    return days;
  }, [data]);

  // Group by weeks
  const weeks = useMemo(() => {
    const result: DayActivity[][] = [];
    let week: DayActivity[] = [];
    
    // Add padding for first week
    const firstDay = new Date(yearData[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      week.push({ date: '', count: 0, level: 0 });
    }
    
    yearData.forEach((day, index) => {
      week.push(day);
      
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });
    
    // Add padding for last week
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ date: '', count: 0, level: 0 });
      }
      result.push(week);
    }
    
    return result;
  }, [yearData]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeDays = yearData.filter(d => d.count > 0).length;
    const totalActivity = yearData.reduce((sum, d) => sum + d.count, 0);
    const maxStreak = calculateMaxStreak(yearData);
    const currentStreak = calculateCurrentStreak(yearData);
    
    return { activeDays, totalActivity, maxStreak, currentStreak };
  }, [yearData]);

  const handleMouseEnter = (day: DayActivity, event: React.MouseEvent) => {
    if (!day.date) return;
    setHoveredDay(day);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const handleClick = (day: DayActivity) => {
    if (day.date && onDayClick) {
      onDayClick(day);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
    >
      {/* Header - Clean and Readable */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Activity Overview</h2>
        
        {/* Stats - Clean card-based layout */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            <span className="font-semibold">{stats.activeDays}</span>
            <span>active days</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
            <span className="font-semibold">{stats.currentStreak}</span>
            <span>current</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
            <span className="font-semibold">{stats.maxStreak}</span>
            <span>longest</span>
          </div>
        </div>
      </div>

      {/* Heatmap - Cleaner mobile display */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 min-w-full">
          {/* Day labels - Show on all screens */}
          <div className="flex flex-col gap-1 justify-start pt-5 pr-2">
            {DAYS.map((day, i) => (
              i % 2 === 1 && (
                <div key={day} className="h-3 text-[10px] sm:text-xs text-gray-500 leading-3">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day[0]}</span>
                </div>
              )
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => {
              // Show month label only at the start of each month
              const showMonth = weekIndex === 0 || (week[0]?.date && new Date(week[0].date).getDate() <= 7);
              const monthName = week[0]?.date ? MONTHS[new Date(week[0].date).getMonth()] : '';
              
              return (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {/* Month label - Better spacing */}
                  <div className="h-4 text-[10px] sm:text-xs text-gray-500 font-medium mb-1">
                    {showMonth ? monthName.slice(0, 3) : ''}
                  </div>

                  {/* Days - Better mobile size */}
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4 rounded-sm cursor-pointer transition-all",
                        day.date && "active:scale-90 sm:hover:ring-2 sm:hover:ring-blue-400 sm:hover:ring-offset-1"
                      )}
                      style={{
                        backgroundColor: day.date ? COLORS[day.level] : 'transparent'
                      }}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(day)}
                      whileHover={{ scale: day.date ? 1.15 : 1 }}
                      whileTap={{ scale: day.date ? 0.9 : 1 }}
                     />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
          <span className="text-[10px] sm:text-sm">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 sm:w-3 sm:h-3 rounded-sm"
              style={{ backgroundColor: COLORS[level as keyof typeof COLORS] }}
            />
          ))}
          <span className="text-[10px] sm:text-sm">More</span>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{stats.totalActivity}</span> total activities this year
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-gray-300">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper functions
function calculateMaxStreak(days: DayActivity[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  days.forEach(day => {
    if (day.count > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
}

function calculateCurrentStreak(days: DayActivity[]): number {
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = days.findIndex(d => d.date === today);
  
  if (todayIndex === -1) return 0;
  
  // Count backwards from today
  for (let i = todayIndex; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
