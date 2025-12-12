import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  snapPoints = [0.9, 0.5],
  initialSnap = 0.5
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
      haptics.light();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close if dragged down significantly
    if (offset > 100 || velocity > 500) {
      haptics.light();
      onClose();
      return;
    }

    // Snap to nearest point
    const windowHeight = window.innerHeight;
    const currentHeight = windowHeight * currentSnap;
    const newHeight = currentHeight - offset;
    const newSnap = newHeight / windowHeight;

    // Find closest snap point
    const closest = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - newSnap) < Math.abs(prev - newSnap) ? curr : prev
    );

    setCurrentSnap(closest);
    haptics.light();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - currentSnap) * 100}%` }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
            style={{
              maxHeight: `${currentSnap * 100}vh`,
              touchAction: 'none',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={() => {
                    haptics.light();
                    onClose();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Content */}
            <div 
              className="overflow-y-auto px-6 py-4"
              style={{
                maxHeight: `calc(${currentSnap * 100}vh - ${title ? '120px' : '60px'})`,
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
