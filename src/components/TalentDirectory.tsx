import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { QuickVerificationStatus } from './VerificationBadge';
import { 
  Search, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Award,
  TrendingUp,
  Filter,
  Grid,
  List,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Code,
  Palette,
  Database,
  Smartphone,
  Settings,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react';

interface TalentDirectoryProps {
  onTalentSelect?: (talentId: string) => void;
  onSaveTalent?: (talentId: string) => void;
  onMessageTalent?: (talentId: string) => void;
}

const talentCategories = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    icon: Code,
    count: 156,
    color: 'bg-blue-100 text-blue-600',
    skills: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript']
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: Database,
    count: 124,
    color: 'bg-green-100 text-green-600',
    skills: ['Node.js', 'Python', 'Java', 'Go', 'C#']
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    icon: Smartphone,
    count: 89,
    color: 'bg-purple-100 text-purple-600',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Kotlin']
  },
  {
    id: 'design',
    name: 'UI/UX Design',
    icon: Palette,
    count: 78,
    color: 'bg-pink-100 text-pink-600',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research']
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    icon: Settings,
    count: 67,
    color: 'bg-orange-100 text-orange-600',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD']
  },
  {
    id: 'data',
    name: 'Data Science',
    icon: BarChart3,
    count: 45,
    color: 'bg-indigo-100 text-indigo-600',
    skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau']
  }
];

const featuredTalents = [
  {
    id: '1',
    name: 'Adebayo Olatunji',
    role: 'Senior Frontend Developer',
    location: 'Lagos, Nigeria',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    hourlyRate: 45,
    experience: '5+ years',
    verificationStatus: 'verified' as const,
    rating: 4.9,
    completedProjects: 28,
    responseTime: '2 hours',
    availability: 'Available',
    badge: 'Top Rated',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: '2',
    name: 'Kemi Adebola',
    role: 'Full Stack Developer',
    location: 'Abuja, Nigeria',
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    hourlyRate: 40,
    experience: '4+ years',
    verificationStatus: 'verified' as const,
    rating: 4.8,
    completedProjects: 22,
    responseTime: '1 hour',
    availability: 'Available',
    badge: 'Rising Talent',
    badgeColor: 'bg-green-100 text-green-800'
  },
  {
    id: '3',
    name: 'Chinedu Okoro',
    role: 'DevOps Engineer',
    location: 'Port Harcourt, Nigeria',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    hourlyRate: 50,
    experience: '6+ years',
    verificationStatus: 'verified' as const,
    rating: 4.9,
    completedProjects: 15,
    responseTime: '4 hours',
    availability: 'Partially Available',
    badge: 'Expert',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
];

const quickStats = [
  { label: 'Total Talents', value: '2,450+', icon: Users, color: 'text-blue-600' },
  { label: 'Verified Professionals', value: '1,890+', icon: Award, color: 'text-green-600' },
  { label: 'Countries', value: '25+', icon: Globe, color: 'text-purple-600' },
  { label: 'Avg. Response Time', value: '2.5 hrs', icon: Zap, color: 'text-orange-600' }
];

export function TalentDirectory({ onTalentSelect, onSaveTalent, onMessageTalent }: TalentDirectoryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedTalents, setSavedTalents] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">African Talent Directory</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover verified professionals across Africa ready to join your team
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search talents by name, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {talentCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="hidden md:flex">
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {/* Featured Talents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured Talents</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTalents.map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="relative mx-auto w-16 h-16">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback>
                              {talent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            <QuickVerificationStatus status={talent.verificationStatus} size="sm" />
                          </div>
                        </div>
                        
                        <div>
                          <Badge className={`mb-2 ${talent.badgeColor}`}>
                            {talent.badge}
                          </Badge>
                          <h3 className="font-semibold">{talent.name}</h3>
                          <p className="text-sm text-muted-foreground">{talent.role}</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">{talent.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-primary">${talent.hourlyRate}/hr</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="font-semibold">{talent.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 justify-center">
                          {talent.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
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
                            size="sm"
                            onClick={() => onTalentSelect?.(talent.id)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talentCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} professionals</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {category.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {category.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Category-specific content */}
        {talentCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.count} verified professionals available for hire
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {category.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="justify-center">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center py-12 text-muted-foreground">
              <category.icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Talent listings coming soon</h3>
              <p>We're preparing detailed listings for this category</p>
              <Button variant="outline" className="mt-4">
                Get notified when available
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}