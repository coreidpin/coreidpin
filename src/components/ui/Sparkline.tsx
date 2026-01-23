import React from 'react';
import { colors } from '../../styles/designSystem';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color = colors.brand.primary[500],
  fillColor,
  strokeWidth = 2,
  className = '',
}) => {
  // Graceful handling for bad data
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={className} aria-hidden="true" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // Avoid division by zero

  // Normalize data points to fit the SVG viewbox
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height; // Invert Y because SVG origin is top-left
    return `${x},${y}`;
  }).join(' ');

  // Create area path if fill color is provided
  const areaPath = fillColor 
    ? `${points} ${width},${height} 0,${height}`
    : '';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img" 
      aria-hidden="true"
    >
      {fillColor && (
        <polygon
          points={`${points} ${width},${height} 0,${height}`}
          fill={fillColor}
          stroke="none"
          opacity={0.2}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
