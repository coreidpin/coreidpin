import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Users, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserTypeSelectorProps {
  selectedType: 'professional' | 'business';
  onTypeChange: (type: 'professional' | 'business') => void;
  className?: string;
}

export function UserTypeSelector({ selectedType, onTypeChange, className }: UserTypeSelectorProps) {
  return (
    <div className={cn("w-full mb-6", className)}>
      <label className="block text-sm font-medium text-white/80 mb-3">
        I am a...
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Professional Option */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeChange('professional')}
          className={cn(
            "relative p-4 rounded-xl border-2 transition-all text-left",
            selectedType === 'professional'
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              selectedType === 'professional' 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-white/5 text-white/60"
            )}>
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className={cn(
                "font-medium mb-1",
                selectedType === 'professional' ? "text-white" : "text-white/80"
              )}>
                Professional
              </div>
              <div className="text-xs text-white/50">
                Looking for opportunities
              </div>
            </div>
          </div>
          
          {selectedType === 'professional' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center"
            >
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* Business Option */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeChange('business')}
          className={cn(
            "relative p-4 rounded-xl border-2 transition-all text-left",
            selectedType === 'business'
              ? "border-purple-500 bg-purple-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              selectedType === 'business' 
                ? "bg-purple-500/20 text-purple-400" 
                : "bg-white/5 text-white/60"
            )}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className={cn(
                "font-medium mb-1",
                selectedType === 'business' ? "text-white" : "text-white/80"
              )}>
                Business
              </div>
              <div className="text-xs text-white/50">
                Hiring talent
              </div>
            </div>
          </div>
          
          {selectedType === 'business' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
