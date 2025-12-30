/**
 * GitHub-style Contribution Graph
 * Displays activity heatmap similar to GitHub's contribution graph
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionGraphProps {
  data: ContributionDay[];
  className?: string;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  data,
  className,
}) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contribution Activity</h3>
        <div className="text-center py-8 text-gray-500 text-sm">
          No contribution data available
        </div>
      </div>
    );
  }

  // Group contributions by week
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  // Start from the first contribution's day of week
  const firstDate = new Date(data[0].date);
  const firstDayOfWeek = firstDate.getDay();

  // Add empty cells for days before first date
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: '',
      count: 0,
      level: 0,
    });
  }

  data.forEach((day, index) => {
    currentWeek.push(day);
    
    const date = new Date(day.date);
    const isSaturday = date.getDay() === 6; // Saturday ends the week
    
    if (isSaturday || index === data.length - 1) {
      // Fill remaining days if last item and not Saturday
      if (index === data.length - 1 && !isSaturday) {
        const lastDay = date.getDay();
        for (let i = lastDay + 1; i < 7; i++) {
          currentWeek.push({
            date: '',
            count: 0,
            level: 0,
          });
        }
      }
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const levelColors = {
    0: 'bg-gray-100',
    1: 'bg-green-200',
    2: 'bg-green-400',
    3: 'bg-green-600',
    4: 'bg-green-800',
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get months for labels
  const getMonthsFromData = () => {
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (!day.date) return;
        const date = new Date(day.date);
        const month = date.getMonth();
        
        if (month !== lastMonth && day.date !== '') {
          months.push({
            label: monthLabels[month],
            weekIndex,
          });
          lastMonth = month;
        }
      });
    });

    return months;
  };

  const months = getMonthsFromData();

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Contribution Activity</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Month Labels */}
          <div className="flex gap-1 pl-12 mb-1">
            {months.map((month, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-500"
                style={{
                  marginLeft: idx === 0 ? 0 : `${(month.weekIndex - (months[idx - 1]?.weekIndex || 0)) * 12}px`,
                }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Graph */}
          <div className="flex gap-1">
            {/* Day Labels - Show all 7 days */}
            <div className="flex flex-col gap-1 pr-2 justify-between" style={{ height: '70px' }}>
              {['Mon', 'Wed', 'Fri'].map((label) => (
                <div key={label} className="h-[10px] flex items-center">
                  <span className="text-[10px] text-gray-500 w-8">{label}</span>
                </div>
              ))}
            </div>

            {/* Contribution Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        'w-[10px] h-[10px] rounded-[2px] transition-all hover:ring-2 hover:ring-gray-400',
                        day.date ? levelColors[day.level] : 'bg-transparent'
                      )}
                      title={
                        day.date
                          ? `${day.count} contributions on ${new Date(day.date).toLocaleDateString()}`
                          : ''
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn('w-[10px] h-[10px] rounded-[2px]', levelColors[level as 0 | 1 | 2 | 3 | 4])}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
