import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageGalleryProps {
  images: string[];
  aspectRatio?: 'video' | 'square' | 'portrait';
  className?: string;
  allowZoom?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  aspectRatio = 'video',
  className,
  allowZoom = true
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className={cn("relative group", className)}>
        {/* Main Display Grid */}
        <div className={cn(
          "grid gap-2",
          images.length === 1 && "grid-cols-1",
          images.length === 2 && "grid-cols-2",
          images.length >= 3 && "grid-cols-2 row-span-2",
        )}>
          {images.slice(0, 4).map((src, idx) => (
            <div 
              key={idx}
              className={cn(
                "relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer",
                aspectRatio === 'video' && "aspect-video",
                aspectRatio === 'square' && "aspect-square",
                images.length >= 3 && idx === 0 && "row-span-2 h-full",
              )}
              onClick={() => {
                setCurrentIndex(idx);
                if (allowZoom) setLightboxOpen(true);
              }}
            >
              <img 
                src={src} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
              <img 
                src={images[currentIndex]} 
                alt={`Image ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-[-50px] top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    className="absolute right-[-50px] top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Mobile controls */}
              <div className="absolute bottom-[-50px] left-0 right-0 flex justify-center gap-4 sm:hidden">
                <button onClick={handlePrev} className="p-2 text-white bg-white/10 rounded-full">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="text-white text-sm py-2">
                  {currentIndex + 1} / {images.length}
                </div>
                <button onClick={handleNext} className="p-2 text-white bg-white/10 rounded-full">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="absolute top-4 left-4 text-white font-medium">
               {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
