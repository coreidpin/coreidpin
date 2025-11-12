import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Star, 
  Users, 
  Building, 
  Award,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Eye,
  ThumbsUp,
  X
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'job' | 'talent' | 'skill' | 'credential' | 'compliance' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  metadata?: any;
}

interface AIRecommendationsEngineProps {
  userType: 'employer' | 'professional' | 'university';
  userProfile?: any;
  onRecommendationAction?: (recommendation: AIRecommendation, action: string) => void;
}

export function AIRecommendationsEngine({ 
  userType, 
  userProfile, 
  onRecommendationAction 
}: AIRecommendationsEngineProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Simulate AI recommendation generation
    const generateRecommendations = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        const mockRecommendations = getRecommendationsForUserType(userType);
        setRecommendations(mockRecommendations);
        setIsLoading(false);
      }, 1500);
    };

    generateRecommendations();
  }, [userType, userProfile]);

  const getRecommendationsForUserType = (type: string): AIRecommendation[] => {
    switch (type) {
      case 'employer':
        return [
          {
            id: 'emp-1',
            type: 'talent',
            title: 'High-Match Candidates Available',
            description: '3 senior developers from Nigeria match your requirements for the React position',
            confidence: 94,
            reasoning: [
              'Skills alignment: React, TypeScript, Node.js',
              'Experience level matches requirements',
              'Geographic preference alignment',
              'Salary expectations within budget'
            ],
            actionable: true,
            priority: 'high',
            metadata: {
              candidates: ['Adebayo Olatunji', 'Ngozi Okwu', 'Kwame Asante'],
              position: 'Senior React Developer',
              matchScores: [94, 91, 88]
            }
          },
          {
            id: 'emp-2',
            type: 'compliance',
            title: 'Optimize Your Compliance Process',
            description: 'Enable automated KYC checks to reduce onboarding time by 60%',
            confidence: 87,
            reasoning: [
              'Current manual process takes 5-7 days',
              'Automated system reduces to 2 days',
              'Similar companies see 60% time reduction',
              'Cost savings of $200 per hire'
            ],
            actionable: true,
            priority: 'medium',
            metadata: {
              currentTime: '5-7 days',
              proposedTime: '2 days',
              savings: '$200 per hire'
            }
          },
          {
            id: 'emp-3',
            type: 'opportunity',
            title: 'Expand to Kenya Market',
            description: 'Strong talent pool in Kenya matches your hiring needs',
            confidence: 82,
            reasoning: [
              'Kenya has 15,000+ verified developers',
              '30% lower average rates than current hires',
              'Strong English proficiency',
              'Timezone compatibility with EU operations'
            ],
            actionable: true,
            priority: 'low',
            metadata: {
              marketSize: '15,000+ developers',
              costSavings: '30%',
              timezone: 'EU compatible'
            }
          }
        ];
      
      case 'professional':
        return [
          {
            id: 'prof-1',
            type: 'job',
            title: 'Perfect Job Match Found',
            description: 'Senior Frontend role at TechCorp matches 96% of your criteria',
            confidence: 96,
            reasoning: [
              'Technology stack: React, TypeScript (your expertise)',
              'Remote-first company culture',
              'Salary range: $85k-110k (within your target)',
              'Company size and growth stage preference match'
            ],
            actionable: true,
            priority: 'high',
            metadata: {
              company: 'TechCorp Global',
              role: 'Senior Frontend Developer',
              salary: '$85,000 - $110,000',
              match: 96
            }
          },
          {
            id: 'prof-2',
            type: 'skill',
            title: 'Boost Your Profile with AI Skills',
            description: 'Adding Machine Learning skills could increase job matches by 40%',
            confidence: 89,
            reasoning: [
              'ML skills in high demand (+40% job postings)',
              'Your math background provides strong foundation',
              'Current React skills complement ML frontend needs',
              'Average salary increase of $15k for ML skills'
            ],
            actionable: true,
            priority: 'medium',
            metadata: {
              skillGap: 'Machine Learning',
              potentialIncrease: '40% more matches',
              salaryBoost: '$15,000'
            }
          },
          {
            id: 'prof-3',
            type: 'credential',
            title: 'Verify Your AWS Certification',
            description: 'Upload your AWS Cloud Practitioner cert to unlock 12 new job opportunities',
            confidence: 91,
            reasoning: [
              'AWS skills mentioned in your experience',
              '12 jobs specifically require AWS certification',
              'Verified credentials increase hire probability by 3x',
              'Cloud skills in high demand'
            ],
            actionable: true,
            priority: 'high',
            metadata: {
              certification: 'AWS Cloud Practitioner',
              newOpportunities: 12,
              hireIncrease: '3x probability'
            }
          }
        ];
      
      case 'university':
        return [
          {
            id: 'uni-1',
            type: 'opportunity',
            title: 'High Employer Demand for Your Graduates',
            description: 'Computer Science graduates have 95% placement rate with verified credentials',
            confidence: 93,
            reasoning: [
              'CS graduates most requested by employers',
              'Verified credential holders get hired 3x faster',
              '45 employers actively seeking your graduates',
              'Average starting salary 25% higher with digital credentials'
            ],
            actionable: true,
            priority: 'high',
            metadata: {
              placementRate: '95%',
              employerCount: 45,
              salaryIncrease: '25%'
            }
          },
          {
            id: 'uni-2',
            type: 'credential',
            title: 'Expand Digital Credential Coverage',
            description: 'Add certificates for Data Science and Cybersecurity programs',
            confidence: 88,
            reasoning: [
              'These programs have highest employer demand',
              'Currently only 60% of programs have digital credentials',
              'Students in these fields get 2x more interview requests',
              'International employers prefer these skills'
            ],
            actionable: true,
            priority: 'medium',
            metadata: {
              suggestedPrograms: ['Data Science', 'Cybersecurity'],
              currentCoverage: '60%',
              interviewIncrease: '2x'
            }
          },
          {
            id: 'uni-3',
            type: 'compliance',
            title: 'Blockchain Verification Upgrade',
            description: 'Upgrade to blockchain anchoring for maximum credential trust',
            confidence: 85,
            reasoning: [
              'Blockchain credentials have 99.9% employer trust',
              'Prevents credential fraud and tampering',
              'Global standard for credential verification',
              'Students report higher job success rates'
            ],
            actionable: true,
            priority: 'low',
            metadata: {
              trustScore: '99.9%',
              fraudPrevention: true,
              globalStandard: true
            }
          }
        ];
      
      default:
        return [];
    }
  };

  const handleRecommendationAction = (recommendation: AIRecommendation, action: string) => {
    if (action === 'dismiss') {
      setDismissedRecommendations(prev => [...prev, recommendation.id]);
    }
    
    onRecommendationAction?.(recommendation, action);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const visibleRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.includes(rec.id)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Analyzing your profile and generating personalized recommendations...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Recommendations
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Personalized suggestions powered by machine learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleRecommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No new recommendations at this time.</p>
              <p className="text-sm">Check back later for fresh insights!</p>
            </div>
          ) : (
            visibleRecommendations.map((recommendation) => (
              <div 
                key={recommendation.id} 
                className={`p-4 rounded-lg border-2 ${getPriorityColor(recommendation.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {recommendation.type === 'job' && <Building className="h-4 w-4" />}
                      {recommendation.type === 'talent' && <Users className="h-4 w-4" />}
                      {recommendation.type === 'skill' && <Star className="h-4 w-4" />}
                      {recommendation.type === 'credential' && <Award className="h-4 w-4" />}
                      {recommendation.type === 'compliance' && <Target className="h-4 w-4" />}
                      {recommendation.type === 'opportunity' && <TrendingUp className="h-4 w-4" />}
                      
                      <h4 className="font-semibold">{recommendation.title}</h4>
                    </div>
                    <Badge className={getPriorityBadgeColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  
                  <button 
                    onClick={() => handleRecommendationAction(recommendation, 'dismiss')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {recommendation.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">AI Confidence:</span>
                  <Progress value={recommendation.confidence} className="w-20 h-2" />
                  <span className="text-xs font-medium">{recommendation.confidence}%</span>
                </div>
                
                <div className="mb-4">
                  <button 
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
                    onClick={() => {
                      // Toggle reasoning display - would need state management
                    }}
                  >
                    <Lightbulb className="h-3 w-3" />
                    Why this recommendation?
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                
                {recommendation.actionable && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleRecommendationAction(recommendation, 'accept')}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Take Action
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRecommendationAction(recommendation, 'view')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Learn More
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRecommendationAction(recommendation, 'like')}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {visibleRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Recommendations update daily based on your activity and market trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Smart Matching Component
interface SmartMatchProps {
  userType: 'employer' | 'professional';
  matchData: any;
  onMatchAction?: (action: string, matchId: string) => void;
}

export function SmartMatch({ userType, matchData, onMatchAction }: SmartMatchProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className="border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Smart Match Found
              </h4>
              <p className="text-sm text-muted-foreground">AI-powered matching • Just now</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            {matchData.matchScore}% match
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">{matchData.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {matchData.matchingCriteria?.map((criteria: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {criteria}
              </Badge>
            ))}
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-muted/30 rounded">
              <h5 className="font-medium mb-2">Match Analysis:</h5>
              <ul className="text-sm space-y-1">
                {matchData.analysis?.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-green-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onMatchAction?.('view', matchData.id)}
            >
              View Profile
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMatchAction?.('contact', matchData.id)}
            >
              {userType === 'employer' ? 'Contact Candidate' : 'Apply Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// AI Insights Component
interface AIInsightsProps {
  userType: 'employer' | 'professional' | 'university';
  insights: Array<{
    title: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    description: string;
    actionable?: boolean;
  }>;
}

export function AIInsights({ userType, insights }: AIInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          AI Market Insights
        </CardTitle>
        <CardDescription>
          Data-driven insights about your market and opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <div className="flex items-center gap-1">
                  {insight.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {insight.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />}
                  {insight.trend === 'stable' && <div className="w-3 h-3 bg-gray-400 rounded-full" />}
                </div>
              </div>
              <div className="text-lg font-semibold mb-1">{insight.value}</div>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}