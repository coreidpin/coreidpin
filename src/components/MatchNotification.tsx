import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Calendar,
  X,
  Building,
  User
} from 'lucide-react';

interface MatchData {
  id: string;
  type: 'talent' | 'job';
  name: string;
  title: string;
  avatar?: string;
  company?: string;
  matchScore: number;
}

interface MatchNotificationProps {
  match: MatchData | null;
  onClose: () => void;
  onMessage: (matchId: string) => void;
  onSchedule?: (matchId: string) => void;
}

export function MatchNotification({ 
  match, 
  onClose, 
  onMessage,
  onSchedule 
}: MatchNotificationProps) {
  useEffect(() => {
    if (match) {
      // Auto-dismiss after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [match, onClose]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-primary shadow-2xl overflow-hidden">
              {/* Celebration Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-success/20 pointer-events-none" />
              
              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.05,
                      ease: 'easeOut'
                    }}
                    className="absolute"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                ))}
              </div>

              <CardContent className="relative p-8 text-center space-y-6">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Match Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <Heart className="h-20 w-20 text-primary fill-primary" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2
                      }}
                      className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                    />
                  </div>
                </motion.div>

                {/* Match Title */}
                <div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold mb-2"
                  >
                    It's a Match! 🎉
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                  >
                    You and {match.name} {match.type === 'talent' ? 'liked each other' : 'are a perfect fit'}
                  </motion.p>
                </div>

                {/* Match Profile */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  {match.type === 'talent' ? (
                    <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage src={match.avatar} alt={match.name} />
                      <AvatarFallback className="text-2xl">
                        {match.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-24 w-24 bg-card rounded-full flex items-center justify-center border-4 border-primary">
                      <Building className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold">{match.name}</h3>
                    <p className="text-sm text-muted-foreground">{match.title}</p>
                    {match.company && (
                      <p className="text-xs text-muted-foreground">{match.company}</p>
                    )}
                  </div>

                  <Badge className="bg-success text-success-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {match.matchScore}% Match
                  </Badge>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3 pt-4"
                >
                  <Button
                    size="lg"
                    onClick={() => onMessage(match.id)}
                    className="w-full"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Send a Message
                  </Button>

                  {onSchedule && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onSchedule(match.id)}
                      className="w-full"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Interview
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </motion.div>

                {/* Nigerian Flavor Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-primary font-medium"
                >
                  🎊 Oya na! Make we connect! 🎊
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
