import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  Users,
  Building,
  GraduationCap
} from 'lucide-react';

interface WelcomeToastProps {
  userType: 'employer' | 'professional' | 'university';
  userName?: string;
  show: boolean;
  onDismiss: () => void;
}

export function WelcomeToast({ userType, userName, show, onDismiss }: WelcomeToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 10000); // Auto-dismiss after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  const userTypeConfig = {
    professional: {
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/20',
      title: 'Welcome to Your Professional Dashboard!',
      features: [
        'Complete your profile for better job matches',
        'Explore verified job opportunities',
        'Connect with global employers'
      ]
    },
    employer: {
      icon: Building,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950/20',
      title: 'Welcome to Your Employer Dashboard!',
      features: [
        'Search our verified talent pool',
        'Post jobs with AI-powered matching',
        'Manage compliance effortlessly'
      ]
    },
    university: {
      icon: GraduationCap,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/20',
      title: 'Welcome to Your University Portal!',
      features: [
        'Issue blockchain-verified credentials',
        'Manage student certificates',
        'Track graduate employment'
      ]
    }
  };

  const config = userTypeConfig[userType];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <Card className="shadow-2xl border-2 border-primary/20 bg-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{config.title}</h3>
                        <Badge variant="secondary" className="px-2 py-0.5">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </div>
                      {userName && (
                        <p className="text-sm text-muted-foreground">
                          Hi {userName}, great to see you!
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onDismiss}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {config.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={onDismiss}
                    className="w-full"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}