import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { QuickVerificationStatus } from './VerificationBadge';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Award,
  TrendingUp,
  Target,
  Brain,
  Sparkles,
  SlidersHorizontal,
  Users,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

interface TalentSearchProps {
  onTalentSelect?: (talentId: string) => void;
  onSaveTalent?: (talentId: string) => void;
  onMessageTalent?: (talentId: string) => void;
}

interface SearchFilters {
  query: string;
  skills: string[];
  location: string[];
  experience: string;
  hourlyRate: [number, number];
  availability: string;
  verificationStatus: string;
}

const mockTalents = [
  {
    id: '1',
    name: 'Adebayo Olatunji',
    role: 'Senior Frontend Developer',
    location: 'Lagos, Nigeria',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    hourlyRate: 45,
    experience: '5+ years',
    availability: 'Available',
    verificationStatus: 'verified' as const,
    rating: 4.9,
    completedProjects: 28,
    responseTime: '2 hours',
    matchScore: 95,
    avatar: undefined,
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Kemi Adebola',
    role: 'Full Stack Developer',
    location: 'Abuja, Nigeria',
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    hourlyRate: 40,
    experience: '4+ years',
    availability: 'Available',
    verificationStatus: 'verified' as const,
    rating: 4.8,
    completedProjects: 22,
    responseTime: '1 hour',
    matchScore: 88,
    avatar: undefined,
    lastActive: '1 hour ago'
  },
  {
    id: '3',
    name: 'Chinedu Okoro',
    role: 'DevOps Engineer',
    location: 'Port Harcourt, Nigeria',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    hourlyRate: 50,
    experience: '6+ years',
    availability: 'Partially Available',
    verificationStatus: 'verified' as const,
    rating: 4.9,
    completedProjects: 15,
    responseTime: '4 hours',
    matchScore: 82,
    avatar: undefined,
    lastActive: '5 hours ago'
  },
  {
    id: '4',
    name: 'Amara Okonkwo',
    role: 'UI/UX Designer',
    location: 'Lagos, Nigeria',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    hourlyRate: 35,
    experience: '3+ years',
    availability: 'Available',
    verificationStatus: 'pending' as const,
    rating: 4.7,
    completedProjects: 18,
    responseTime: '3 hours',
    matchScore: 78,
    avatar: undefined,
    lastActive: '1 day ago'
  }
];

export function TalentSearch({ onTalentSelect, onSaveTalent, onMessageTalent }: TalentSearchProps) {
  const [searchResults, setSearchResults] = useState(mockTalents);
  const [showFilters, setShowFilters] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [savedTalents, setSavedTalents] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    skills: [],
    location: [],
    experience: '',
    hourlyRate: [0, 100],
    availability: '',
    verificationStatus: ''
  });

  const handleSearch = async () => {
    setIsAISearching(true);
    
    // Simulate AI-powered search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock filtering logic
    let filtered = mockTalents.filter(talent => {
      const matchesQuery = !filters.query || 
        talent.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        talent.role.toLowerCase().includes(filters.query.toLowerCase()) ||
        talent.skills.some(skill => skill.toLowerCase().includes(filters.query.toLowerCase()));
      
      const matchesLocation = filters.location.length === 0 || 
        filters.location.some(loc => talent.location.includes(loc));
      
      const matchesRate = talent.hourlyRate >= filters.hourlyRate[0] && 
        talent.hourlyRate <= filters.hourlyRate[1];
      
      const matchesVerification = !filters.verificationStatus || 
        talent.verificationStatus === filters.verificationStatus;
      
      return matchesQuery && matchesLocation && matchesRate && matchesVerification;
    });

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);
    
    setSearchResults(filtered);
    setIsAISearching(false);
  };

  const handleSaveTalent = (talentId: string) => {
    const newSaved = new Set(savedTalents);
    if (savedTalents.has(talentId)) {
      newSaved.delete(talentId);
    } else {
      newSaved.add(talentId);
    }
    setSavedTalents(newSaved);
    onSaveTalent?.(talentId);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      skills: [],
      location: [],
      experience: '',
      hourlyRate: [0, 100],
      availability: '',
      verificationStatus: ''
    });
    setSearchResults(mockTalents);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Find Verified Talent
              </CardTitle>
              <CardDescription>
                AI-powered search to find the perfect candidates for your needs
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Brain className="h-3 w-3" />
              AI-Enhanced
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or skills..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button 
              onClick={handleSearch}
              disabled={isAISearching}
              className="gap-2 min-w-[120px]"
            >
              {isAISearching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Search
                </>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Separator className="my-4" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Select 
                      value={filters.location[0] || ''} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        location: value ? [value] : [] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        <SelectItem value="Lagos">Lagos, Nigeria</SelectItem>
                        <SelectItem value="Abuja">Abuja, Nigeria</SelectItem>
                        <SelectItem value="Port Harcourt">Port Harcourt, Nigeria</SelectItem>
                        <SelectItem value="Accra">Accra, Ghana</SelectItem>
                        <SelectItem value="Nairobi">Nairobi, Kenya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Experience Level</Label>
                    <Select 
                      value={filters.experience} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any experience</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5+">5+ years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Verification Status</Label>
                    <Select 
                      value={filters.verificationStatus} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, verificationStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        <SelectItem value="verified">Verified only</SelectItem>
                        <SelectItem value="pending">Pending verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Hourly Rate Range: ${filters.hourlyRate[0]} - ${filters.hourlyRate[1]}</Label>
                    <Slider
                      value={filters.hourlyRate}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, hourlyRate: value as [number, number] }))}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {searchResults.length} talent{searchResults.length !== 1 ? 's' : ''} found
          </h3>
          {isAISearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              AI is analyzing matches...
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
            {searchResults.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage src={talent.avatar} alt={talent.name} />
                          <AvatarFallback>
                            {talent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">{talent.name}</h4>
                                <QuickVerificationStatus status={talent.verificationStatus} />
                              </div>
                              <p className="text-muted-foreground">{talent.role}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {talent.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                                  {talent.rating}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {talent.completedProjects} projects
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">{talent.matchScore}% match</span>
                              </div>
                              <div className="text-lg font-semibold text-primary">${talent.hourlyRate}/hr</div>
                              <div className="text-sm text-muted-foreground">{talent.availability}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {talent.skills.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {talent.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{talent.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Responds in {talent.responseTime} • Last active {talent.lastActive}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSaveTalent(talent.id)}
                                className={savedTalents.has(talent.id) ? "text-red-600 border-red-200" : ""}
                              >
                                <Heart className={`h-4 w-4 ${savedTalents.has(talent.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onMessageTalent?.(talent.id)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onTalentSelect?.(talent.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => onTalentSelect?.(talent.id)}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {searchResults.length === 0 && !isAISearching && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No talents found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}