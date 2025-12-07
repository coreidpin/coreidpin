import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock,
  Building,
  Users,
  TrendingUp,
  X,
  Heart,
  Info,
  Star
} from 'lucide-react';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string; // Remote, Hybrid, On-site
  employmentType: string; // Full-time, Part-time, Contract
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  matchScore?: number;
}

interface JobSwipeCardProps {
  job: JobOpportunity;
  onSwipeLeft: (jobId: string) => void;
  onSwipeRight: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
}

export function JobSwipeCard({ 
  job, 
  onSwipeLeft, 
  onSwipeRight, 
  onViewJob 
}: JobSwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 300 : -300);
      
      if (info.offset.x > 0) {
        onSwipeRight(job.id);
      } else {
        onSwipeLeft(job.id);
      }
    }
  };

  const handlePass = () => {
    setExitX(-300);
    onSwipeLeft(job.id);
  };

  const handleApply = () => {
    setExitX(300);
    onSwipeRight(job.id);
  };

  const formatSalary = () => {
    const { min, max, currency } = job.salary;
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute w-full max-w-md"
    >
      <Card className="overflow-hidden border-2 hover:shadow-2xl transition-shadow">
        {/* Header */}
        <CardHeader className="relative bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-card rounded-lg flex items-center justify-center border-2 border-primary/20">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="h-12 w-12 object-contain" />
              ) : (
                <Building className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{job.title}</h3>
                {job.matchScore && (
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                    {job.matchScore}%
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-2">{job.company}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            </div>
          </div>

          {/* Posted Date */}
          <Badge variant="outline" className="absolute top-4 right-4">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeAgo(job.postedDate)}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Job Type & Employment */}
          <div className="flex gap-2">
            <Badge variant="secondary">
              {job.type}
            </Badge>
            <Badge variant="secondary">
              {job.employmentType}
            </Badge>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
            <DollarSign className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Salary Range</p>
              <p className="font-semibold text-success">{formatSalary()}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          {/* Benefits Preview */}
          {job.benefits.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Benefits</p>
              <div className="space-y-1">
                {job.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
                {job.benefits.length > 3 && (
                  <p className="text-xs text-muted-foreground ml-5">
                    +{job.benefits.length - 3} more benefits
                  </p>
                )}
              </div>
            </div>
          )}

          {/* View Details Button */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewJob(job.id)}
              className="w-full text-xs"
            >
              <Info className="h-4 w-4 mr-1" />
              View Full Job Details
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePass}
              className="flex-1 border-2 hover:bg-destructive/10 hover:border-destructive"
            >
              <X className="h-5 w-5 mr-2" />
              Pass
            </Button>
            
            <Button
              size="lg"
              onClick={handleApply}
              className="flex-1"
            >
              <Heart className="h-5 w-5 mr-2" />
              Interested
            </Button>
          </div>

          {/* Swipe Instructions */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Swipe left to pass • Swipe right to apply
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
