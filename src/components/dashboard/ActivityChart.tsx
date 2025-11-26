import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { colors, typography, spacing, borderRadius } from '../../styles/designTokens';
import { shadows } from '../../styles/shadows';

interface DataPoint {
  day: string;
  value: number;
}

interface ActivityChartProps {
  data: DataPoint[];
  period?: '7d' | '30d' | '90d';
  onPeriodChange?: (period: '7d' | '30d' | '90d') => void;
}

export function ActivityChart({
  data,
  period = '30d',
  onPeriodChange,
}: ActivityChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calculate chart dimensions
  const chartWidth = 300;
  const chartHeight = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find min/max values
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  // Create points for the line path
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * innerHeight;
    return { x, y, value: d.value, day: d.day };
  });

  // Create SVG path for area chart
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaPath = `${linePath} L ${chartWidth - padding.right} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  const periods = [
    { label: '7D', value: '7d' as const },
    { label: '30D', value: '30d' as const },
    { label: '90D', value: '90d' as const },
  ];

  // Shared Background Component
  const PremiumBackground = () => (
    <>
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: borderRadius.xl,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        padding: spacing[6],
      }}
    >
      <PremiumBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-white mb-1"
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              PIN Activity
            </h2>
            <p
              className="text-gray-400"
              style={{
                fontSize: typography.fontSize.sm,
              }}
            >
              Your verification activity over time
            </p>
          </div>

          <div className="flex items-center gap-1" style={{ fontSize: typography.fontSize.xs }}>
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-semibold">+12%</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-lg inline-flex border border-white/10">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange?.(p.value)}
              className="px-3 py-1.5 rounded-md transition-all duration-200"
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: period === p.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: period === p.value ? 'white' : colors.gray400,
                boxShadow: period === p.value ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}

            {/* Gradient definition for area fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            {/* Line path */}
            <motion.path
              d={linePath}
              stroke="#60A5FA"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' }}
            />

            {/* Data points */}
            {points.map((point, i) => (
              <g key={i}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === i ? 5 : 3}
                  fill="#1a1a1a"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.02 }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredPoint !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg pointer-events-none z-20"
              style={{
                left: points[hoveredPoint].x,
                top: points[hoveredPoint].y - 50,
                transform: 'translateX(-50%)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                fontSize: typography.fontSize.xs,
              }}
            >
              <div className="font-semibold text-white">
                {points[hoveredPoint].value} verifications
              </div>
              <div className="text-gray-400">{data[hoveredPoint].day}</div>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div>
            <div className="text-2xl font-bold text-white">{values.reduce((a, b) => a + b, 0)}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}</div>
            <div className="text-xs text-gray-400">Avg/day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{Math.max(...values)}</div>
            <div className="text-xs text-gray-400">Peak</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
