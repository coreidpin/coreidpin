import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  MessageCircle, 
  Calendar, 
  FileText, 
  CheckCircle,
  Clock,
  User,
  Building,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Send,
  Phone,
  Video,
  Mail
} from 'lucide-react';

interface Match {
  id: string;
  type: 'talent' | 'job';
  name: string;
  title: string;
  company?: string;
  avatar?: string;
  matchScore: number;
  matchedDate: string;
  status: 'new' | 'messaged' | 'interview-scheduled' | 'offer-sent' | 'hired';
  lastMessage?: string;
  unreadCount?: number;
}

interface MatchesViewProps {
  type: 'employer' | 'professional';
  matches: Match[];
  onMessage: (matchId: string) => void;
  onScheduleInterview: (matchId: string) => void;
  onSendOffer: (matchId: string) => void;
}

export function MatchesView({ 
  type, 
  matches = [], 
  onMessage,
  onScheduleInterview,
  onSendOffer
}: MatchesViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [messageText, setMessageText] = useState('');

  const filterMatches = (status?: string) => {
    let filtered = matches;

    if (status && status !== 'all') {
      filtered = filtered.filter(m => m.status === status);
    }

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'new': { label: 'New Match', variant: 'default' as const, icon: CheckCircle },
      'messaged': { label: 'Messaged', variant: 'secondary' as const, icon: MessageCircle },
      'interview-scheduled': { label: 'Interview Scheduled', variant: 'default' as const, icon: Calendar },
      'offer-sent': { label: 'Offer Sent', variant: 'default' as const, icon: FileText },
      'hired': { label: 'Hired', variant: 'default' as const, icon: CheckCircle }
    };

    const badge = badges[status as keyof typeof badges] || badges.new;
    return (
      <Badge variant={badge.variant} className="gap-1">
        <badge.icon className="h-3 w-3" />
        {badge.label}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedMatch) {
      onMessage(selectedMatch.id);
      setMessageText('');
    }
  };

  const filteredMatches = filterMatches(activeTab);
  const matchCounts = {
    all: matches.length,
    new: matches.filter(m => m.status === 'new').length,
    messaged: matches.filter(m => m.status === 'messaged').length,
    'interview-scheduled': matches.filter(m => m.status === 'interview-scheduled').length,
    'offer-sent': matches.filter(m => m.status === 'offer-sent').length,
    hired: matches.filter(m => m.status === 'hired').length
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Matches List */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Your Matches ({matches.length})
            </CardTitle>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pb-2 border-b">
                <TabsList className="w-full grid grid-cols-3 h-auto">
                  <TabsTrigger value="all" className="text-xs">
                    All <Badge variant="secondary" className="ml-1">{matchCounts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="new" className="text-xs">
                    New <Badge variant="secondary" className="ml-1">{matchCounts.new}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="interview-scheduled" className="text-xs">
                    Scheduled <Badge variant="secondary" className="ml-1">{matchCounts['interview-scheduled']}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredMatches.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No matches found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMatches.map((match) => (
                      <motion.div
                        key={match.id}
                        whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedMatch?.id === match.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            {match.type === 'talent' ? (
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={match.avatar} alt={match.name} />
                                <AvatarFallback>
                                  {match.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-12 w-12 bg-card rounded-full flex items-center justify-center border-2">
                                <Building className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            
                            {match.unreadCount && match.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                                {match.unreadCount}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-sm truncate">{match.name}</h4>
                              <Badge variant="outline" className="text-xs ml-2">
                                {match.matchScore}%
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground truncate mb-2">
                              {match.title}
                              {match.company && ` • ${match.company}`}
                            </p>

                            {getStatusBadge(match.status)}

                            {match.lastMessage && (
                              <p className="text-xs text-muted-foreground mt-2 truncate">
                                {match.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Match Details & Chat */}
      <div className="lg:col-span-2">
        {selectedMatch ? (
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex items-start gap-4">
                {selectedMatch.type === 'talent' ? (
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={selectedMatch.avatar} alt={selectedMatch.name} />
                    <AvatarFallback className="text-xl">
                      {selectedMatch.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center border-2 border-primary/20">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{selectedMatch.name}</h3>
                    {getStatusBadge(selectedMatch.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{selectedMatch.title}</p>
                  {selectedMatch.company && (
                    <p className="text-xs text-muted-foreground">{selectedMatch.company}</p>
                  )}
                  
                  <Badge variant="secondary" className="mt-2">
                    Matched {new Date(selectedMatch.matchedDate).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onScheduleInterview(selectedMatch.id)}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                
                {type === 'employer' && (
                  <Button
                    variant="outline"
                    onClick={() => onSendOffer(selectedMatch.id)}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Send Offer
                  </Button>
                )}
              </div>

              {/* Contact Options */}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
              </div>

              {/* Chat Interface */}
              <div className="border rounded-lg">
                <div className="h-[300px] p-4 overflow-y-auto bg-muted/30">
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Start your conversation with {selectedMatch.name}
                  </div>
                </div>

                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send • Shift + Enter for new line
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-16">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Select a Match</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Choose a match from the list to view details and start a conversation
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
