import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Quote, Sparkles, Star, Heart, Zap } from 'lucide-react';

interface InspirationMessage {
  id: number;
  message: string;
  author: string;
  icon: typeof Quote;
  gradient: string;
}

const inspirationMessages: InspirationMessage[] = [
  {
    id: 1,
    message: "Your hustle today na your success tomorrow. No gree for anybody!",
    author: "nwanne Community",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    message: "Na small small we dey take build empire. Your consistency go pay!",
    author: "African Tech Leader",
    icon: Star,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    message: "E no matter where you start, wetin matter na say you start!",
    author: "nwanne Wisdom",
    icon: Heart,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    message: "Your talent plus our platform = Global opportunities. Make we dey go!",
    author: "nwanne Team",
    icon: Zap,
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    message: "Every big developer for Silicon Valley don start from somewhere. Your turn don reach!",
    author: "Tech Inspiration",
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    message: "Nah your skills go speak for you. We go just make sure say the right people dey hear am!",
    author: "nwanne Promise",
    icon: Star,
    gradient: "from-yellow-500 to-orange-500"
  }
];

interface OnboardingInspirationProps {
  userType?: 'professional' | 'employer' | 'university';
}

export function OnboardingInspiration({ userType = 'professional' }: OnboardingInspirationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % inspirationMessages.length);
    }, 6000); // Change message every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const currentMessage = inspirationMessages[currentIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="sticky top-8 space-y-6">
      {/* Main inspiration card */}
      <Card className="border-2 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <motion.div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentMessage.gradient} flex items-center justify-center flex-shrink-0`}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Icon className="h-5 w-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Daily Motivation
              </h3>
              <div className="flex gap-1">
                {inspirationMessages.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1 rounded-full ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ width: `${100 / inspirationMessages.length}%` }}
                    initial={false}
                    animate={{
                      opacity: index === currentIndex ? 1 : 0.5
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Quote className="h-8 w-8 text-primary/20 mb-3" />
              <p className="text-lg mb-4 leading-relaxed">
                {currentMessage.message}
              </p>
              <p className="text-sm text-muted-foreground">
                — {currentMessage.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <Card className="border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-4">Join thousands of professionals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile completion</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-xs text-muted-foreground">Verified pros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2.5K+</div>
                <div className="text-xs text-muted-foreground">Employers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick tips */}
      <Card className="border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-4">💡 Pro Tips</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <motion.li
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-primary mt-0.5">✓</span>
              <span>Complete your profile to 100% for better visibility</span>
            </motion.li>
            <motion.li
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-primary mt-0.5">✓</span>
              <span>Add your LinkedIn for faster verification</span>
            </motion.li>
            <motion.li
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-primary mt-0.5">✓</span>
              <span>Use AI analysis to highlight your strengths</span>
            </motion.li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
