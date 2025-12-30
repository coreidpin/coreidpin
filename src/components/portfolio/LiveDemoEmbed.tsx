/**
 * Live Demo Embed Component
 * Displays live demo in an iframe with controls
 */

import React, { useState } from 'react';
import { ExternalLink, Maximize2, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LiveDemoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

type ViewMode = 'desktop' | 'mobile';

export const LiveDemoEmbed: React.FC<LiveDemoEmbedProps> = ({
  url,
  title = 'Live Demo',
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const iframeDimensions = {
    desktop: 'w-full h-[600px]',
    mobile: 'w-[375px] h-[667px] mx-auto',
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Header Controls */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'desktop'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'mobile'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Demo Container */}
      <div className="bg-gray-100 p-4 min-h-[400px] flex items-center justify-center">
        <div className={cn('relative bg-white shadow-lg rounded-lg overflow-hidden', iframeDimensions[viewMode])}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-sm text-gray-600">Loading demo...</p>
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={key}
            src={url}
            title={title}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            loading="lazy"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Interactive demo - some features may be limited in embedded mode</span>
          <div className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            <span>Use full screen for best experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};
