import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from './dialog';
import { Button } from './button';

// --- 1. Snowfall Animation ---
export const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<any[]>([]);

  useEffect(() => {
    // Generate snowflakes on mount
    const count = 30; // Number of flakes
    const flakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position %
      delay: Math.random() * 5, // Random start delay
      duration: 10 + Math.random() * 10, // Random fall duration (slow)
      size: 4 + Math.random() * 6, // Random size
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute bg-white rounded-full opacity-60"
          initial={{ y: -20, x: `${flake.x}vw`, opacity: 0 }}
          animate={{
            y: '100vh',
            x: [`${flake.x}vw`, `${flake.x + (Math.random() * 10 - 5)}vw`], // Slight drift
            opacity: [0, 0.8, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: flake.size,
            height: flake.size,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
};

// --- 2. Santa Hat ---
export const SantaHat = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ zIndex: 60 }}>
      {/* Simple SVG Santa Hat */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md transform -rotate-12"
      >
        {/* Red Hat Base */}
        <path
          d="M10 80 C 10 80, 40 10, 80 80"
          fill="#D42426"
        />
        {/* White Trim */}
        <path
          d="M5 80 Q 50 90 95 80"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Pom Pom */}
        <circle cx="10" cy="80" r="8" fill="white" />
        <circle cx="40" cy="10" r="10" fill="white" />
      </svg>
    </div>
  );
};

// --- 3. Holiday Gift Widget ---
export const HolidayGiftWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaim = () => {
    setShowConfetti(true);
    setIsOpen(false);
    // Reset confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-purple-500'][i % 5]}`}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * window.innerWidth * 0.8, 
                y: (Math.random() - 0.5) * window.innerHeight * 0.8, 
                scale: [1, 0],
                rotate: Math.random() * 720
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ))}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -100, scale: 1.5 }}
            transition={{ duration: 2 }}
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 shadow-xl"
            style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
          >
            JOY CLAIMED! ✨
          </motion.div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {/* Tooltip on hover */}
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute right-full mr-4 top-1 bg-white text-black px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap"
            >
              A gift for you! 🎁
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="relative group bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
          >
            <Gift className="h-6 w-6" />
          </motion.div>
          
          {/* Sparkles effect */}
          <div className="absolute -top-1 -right-1">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </motion.div>
          </div>
        </motion.button>
      </div>

      {/* Gift Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-600 to-red-800 border-none text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center p-6 relative z-10"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Gift className="h-20 w-20 text-yellow-300" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2">Happy Holidays!</h2>
            <p className="text-white/90 mb-6 text-lg">
              Wishing you a season filled with joy, success, and verified opportunities! 
              <br/><br/>
              Thank you for being part of the GidiPIN community. 
              Here's to a fantastic new year ahead! 🚀
            </p>

            <div className="flex gap-4">
              <Button 
                onClick={handleClaim}
                className="bg-white text-red-700 hover:bg-gray-100 font-bold"
              >
                Claim Your Joy ✨
              </Button>
            </div>
            
            {/* Decorative BG elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-300/10 rounded-full blur-3xl translate-x-10 translate-y-10"></div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};
