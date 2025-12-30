import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  thumbnail?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, thumbnail, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url) return null;

  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    return url;
  };

  const isVideoFile = url.match(/\.(mp4|webm|ogg)$/i);

  if (!isPlaying && thumbnail) {
    return (
      <div 
        className={`relative cursor-pointer group aspect-video rounded-lg overflow-hidden bg-black ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={thumbnail} 
          alt="Video thumbnail" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-current ml-1" />
          </div>
        </div>
      </div>
    );
  }

  if (isVideoFile) {
     return (
       <video 
         controls 
         autoPlay={isPlaying}
         className={`aspect-video rounded-lg bg-black w-full ${className}`}
       >
         <source src={url} />
         Your browser does not support the video tag.
       </video>
     );
  }

  return (
    <div className={`aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
      <iframe
        src={getEmbedUrl(url)}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
