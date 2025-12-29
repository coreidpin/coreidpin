import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface TourStep {
  target: string; // CSS selector or element ID
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  steps,
  onComplete,
  onSkip,
  storageKey = 'product-tour-completed'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setIsActive(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      return () => window.removeEventListener('resize', updateTargetPosition);
    }
  }, [currentStep, isActive]);

  const updateTargetPosition = () => {
    const step = steps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'skipped');
    setIsActive(false);
    onSkip();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'completed');
    setIsActive(false);
    onComplete();
  };

  const getTooltipPosition = () => {
    const step = steps[currentStep];
    const placement = step.placement || 'bottom';
    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 250;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Safety check: if target element wasn't found or is at 0,0, center the tooltip
    if (targetPosition.top === 0 && targetPosition.left === 0 && targetPosition.width === 0) {
      return {
        top: viewportHeight / 2,
        left: viewportWidth / 2,
        transform: 'translate(-50%, -50%)'
      };
    }

    let top = 0;
    let left = 0;
    let transform = '';

    switch (placement) {
      case 'top':
        top = targetPosition.top - padding;
        left = Math.min(
          Math.max(targetPosition.left + targetPosition.width / 2, tooltipWidth / 2 + 20),
          viewportWidth - tooltipWidth / 2 - 20
        );
        transform = 'translate(-50%, -100%)';
        break;
      
      case 'bottom':
        top = targetPosition.top + targetPosition.height + padding;
        left = Math.min(
          Math.max(targetPosition.left + targetPosition.width / 2, tooltipWidth / 2 + 20),
          viewportWidth - tooltipWidth / 2 - 20
        );
        transform = 'translate(-50%, 0)';
        break;
      
      case 'left':
        top = Math.min(
          Math.max(targetPosition.top + targetPosition.height / 2, tooltipHeight / 2 + 20),
          viewportHeight - tooltipHeight / 2 - 20
        );
        left = targetPosition.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      
      case 'right':
        top = Math.min(
          Math.max(targetPosition.top + targetPosition.height / 2, tooltipHeight / 2 + 20),
          viewportHeight - tooltipHeight / 2 - 20
        );
        left = targetPosition.left + targetPosition.width + padding;
        transform = 'translate(0, -50%)';
        break;
      
      default:
        // Bottom center as fallback
        top = targetPosition.top + targetPosition.height + padding;
        left = viewportWidth / 2;
        transform = 'translate(-50%, 0)';
    }

    // Ensure tooltip stays within viewport
    if (top < 20) top = 20;
    if (top + tooltipHeight > viewportHeight - 20) {
      top = viewportHeight - tooltipHeight - 20;
    }

    return { top, left, transform };
  };

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleSkip}
      />

      {/* Spotlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: targetPosition.top - 8,
          left: targetPosition.left - 8,
          width: targetPosition.width + 16,
          height: targetPosition.height + 16,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10001] pointer-events-auto"
        style={{
          ...tooltipPosition,
          maxWidth: '400px',
          width: 'calc(100vw - 40px)' // Ensure it fits on mobile
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {currentStep + 1}
                </div>
                <h3 className="font-semibold">{currentStepData.title}</h3>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {currentStepData.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-6 bg-blue-600'
                        : index < currentStep
                        ? 'w-1.5 bg-blue-400'
                        : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="border-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Got it!
                  </Button>
                )}
              </div>
            </div>

            {/* Skip link */}
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600 mt-3 w-full text-center transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
