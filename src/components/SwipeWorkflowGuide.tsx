import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Target, 
  Shield, 
  Heart, 
  Briefcase, 
  ArrowRight,
  X 
} from 'lucide-react';

interface SwipeWorkflowGuideProps {
  userType: 'employer' | 'professional';
  onClose: () => void;
  onGetStarted: () => void;
}

export function SwipeWorkflowGuide({ 
  userType, 
  onClose, 
  onGetStarted 
}: SwipeWorkflowGuideProps) {
  const workflowSteps = userType === 'employer' 
    ? [
        {
          icon: Target,
          title: 'Swipe',
          description: 'Browse through verified Nigerian talent. Swipe right if interested, left to pass.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        },
        {
          icon: Shield,
          title: 'Verify',
          description: 'All talent is pre-verified for compliance, credentials, and skills.',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          icon: Heart,
          title: 'Match',
          description: 'Get instant notifications when a candidate is also interested in your opportunity.',
          color: 'text-pink-500',
          bgColor: 'bg-pink-500/10'
        },
        {
          icon: Briefcase,
          title: 'Hire',
          description: 'Message, schedule interviews, and make offers—all within the platform.',
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        }
      ]
    : [
        {
          icon: Target,
          title: 'Swipe',
          description: 'Browse through job opportunities from global employers. Swipe right to apply, left to pass.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        },
        {
          icon: Shield,
          title: 'Verify',
          description: 'Complete your profile and verification to appear in employer swipes.',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          icon: Heart,
          title: 'Match',
          description: 'Get matched when an employer is also interested in your profile.',
          color: 'text-pink-500',
          bgColor: 'bg-pink-500/10'
        },
        {
          icon: Briefcase,
          title: 'Get Hired',
          description: 'Connect with employers, interview, and start your new role with full compliance support.',
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        }
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl"
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center text-3xl pr-10">
              {userType === 'employer' 
                ? '🚀 How to Hire on nwanne' 
                : '💼 How to Get Hired on nwanne'}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {userType === 'employer'
                ? 'Find and hire verified Nigerian talent in 4 simple steps'
                : 'Land your dream job with global employers in 4 simple steps'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Workflow Steps */}
            <div className="grid md:grid-cols-2 gap-4">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="border-2 border-muted hover:border-primary/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${step.bgColor} flex-shrink-0`}>
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow connector for desktop */}
                  {index < workflowSteps.length - 1 && index % 2 === 0 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>Pro Tips</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                {userType === 'employer' ? (
                  <>
                    <li>• Use filters to find talent that matches your specific requirements</li>
                    <li>• Check verification badges to ensure compliance</li>
                    <li>• Review match scores to see AI-powered compatibility</li>
                    <li>• Act fast—top talent gets multiple offers!</li>
                  </>
                ) : (
                  <>
                    <li>• Complete your profile to 100% for better matches</li>
                    <li>• Upload verified credentials to build trust</li>
                    <li>• Keep your availability status updated</li>
                    <li>• Respond quickly to match notifications</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Got it, let me explore
              </Button>
              <Button
                onClick={() => {
                  onGetStarted();
                  onClose();
                }}
                className="flex-1"
              >
                Start Swiping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
