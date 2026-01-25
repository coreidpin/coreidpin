import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  RotateCcw, 
  Settings, 
  Filter,
  Heart,
  X,
  Sparkles,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';
import { TalentSwipeCard } from './TalentSwipeCard';
import { JobSwipeCard } from './JobSwipeCard';
import { MatchNotification } from './MatchNotification';

interface SwipeInterfaceProps {
  type: 'employer' | 'professional';
  profiles?: any[];
  jobs?: any[];
  onLoadMore?: () => void;
  onMatch?: (id: string) => void;
  onMessage?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

export function SwipeInterface({ 
  type, 
  profiles = [], 
  jobs = [],
  onLoadMore,
  onMatch,
  onMessage,
  onSchedule
}: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<string[]>([]);
  const [matchedItem, setMatchedItem] = useState<any>(null);
  const [stats, setStats] = useState({
    viewed: 0,
    liked: 0,
    passed: 0,
    matches: 0
  });

  const items = type === 'employer' ? profiles : jobs;
  const currentItem = items[currentIndex];
  const hasMore = currentIndex < items.length;

  const handleSwipeRight = (id: string) => {
    setSwipeHistory([...swipeHistory, id]);
    setStats(prev => ({ ...prev, liked: prev.liked + 1 }));
    
    // Simulate match (30% chance for demo)
    if (Math.random() > 0.7) {
      setStats(prev => ({ ...prev, matches: prev.matches + 1 }));
      setMatchedItem(currentItem);
      onMatch?.(id);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setStats(prev => ({ ...prev, viewed: prev.viewed + 1 }));
      
      // Load more when approaching end
      if (currentIndex >= items.length - 3) {
        onLoadMore?.();
      }
    }, 300);
  };

  const handleSwipeLeft = (id: string) => {
    setStats(prev => ({ ...prev, passed: prev.passed + 1 }));
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setStats(prev => ({ ...prev, viewed: prev.viewed + 1 }));
      
      if (currentIndex >= items.length - 3) {
        onLoadMore?.();
      }
    }, 300);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setStats(prev => ({ 
        ...prev, 
        viewed: Math.max(0, prev.viewed - 1),
        liked: Math.max(0, prev.liked - 1)
      }));
    }
  };

  const handleViewProfile = (id: string) => {
  };

  const handleCloseMatch = () => {
    setMatchedItem(null);
  };

  const handleMessage = (id: string) => {
    onMessage?.(id);
    setMatchedItem(null);
  };

  const progressPercentage = items.length > 0 ? ((currentIndex / items.length) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Stats */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {type === 'employer' ? '🔍 Discover Talent' : '💼 Find Opportunities'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {type === 'employer' 
                  ? 'Swipe to find verified professionals' 
                  : 'Swipe to explore job opportunities'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {currentIndex} of {items.length}
              </span>
              <span className="text-primary font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.viewed}</div>
              <div className="text-xs text-muted-foreground">Viewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.liked}</div>
              <div className="text-xs text-muted-foreground">Liked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.passed}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.matches}</div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Cards Container */}
      <div className="relative h-[600px] flex items-center justify-center">
        <AnimatePresence>
          {!hasMore ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <Card className="p-8">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold">You're All Caught Up!</h3>
                  
                  <p className="text-muted-foreground">
                    {type === 'employer'
                      ? "You've reviewed all available talent. Check back soon for more profiles!"
                      : "You've viewed all current opportunities. More jobs are added daily!"}
                  </p>

                  {stats.matches > 0 && (
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                      <p className="font-semibold text-success mb-1">
                        🎉 {stats.matches} Match{stats.matches !== 1 ? 'es' : ''} Found!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check your matches tab to start conversations
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentIndex(0)} className="flex-1">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Review Again
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      Adjust Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Show next 2 cards in stack for preview */}
              {items.slice(currentIndex + 1, currentIndex + 3).map((item, index) => (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    zIndex: 2 - index,
                    transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * -10}px)`,
                    opacity: 1 - (index + 1) * 0.3
                  }}
                >
                  <Card className="w-full max-w-md h-[580px] border-2 opacity-50" />
                </div>
              ))}

              {/* Current Card */}
              {currentItem && (
                <div style={{ zIndex: 3 }}>
                  {type === 'employer' ? (
                    <TalentSwipeCard
                      profile={currentItem}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onViewProfile={handleViewProfile}
                    />
                  ) : (
                    <JobSwipeCard
                      job={currentItem}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onViewJob={handleViewProfile}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      {hasMore && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center items-center gap-4 mt-6"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={handleUndo}
            disabled={currentIndex === 0}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={() => currentItem && handleSwipeLeft(currentItem.id)}
            >
              <X className="h-8 w-8" />
            </Button>

            <Button
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={() => currentItem && handleSwipeRight(currentItem.id)}
            >
              <Heart className="h-8 w-8" />
            </Button>
          </div>

          <div className="h-12 w-12" /> {/* Spacer for symmetry */}
        </motion.div>
      )}

      {/* Match Notification */}
      <MatchNotification
        match={matchedItem ? {
          id: matchedItem.id,
          type: type === 'employer' ? 'talent' : 'job',
          name: matchedItem.name || matchedItem.title,
          title: matchedItem.title,
          avatar: matchedItem.avatar,
          company: matchedItem.company,
          matchScore: matchedItem.matchScore || 85
        } : null}
        onClose={handleCloseMatch}
        onMessage={handleMessage}
        onSchedule={onSchedule}
      />
    </div>
  );
}
