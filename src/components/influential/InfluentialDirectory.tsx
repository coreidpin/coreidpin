import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Filter, Search, MapPin, Award, Briefcase, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { InfluentialBadge } from './InfluentialBadge';
import { getInfluentialProfessionals } from '../../utils/influentialProfessionals';
import { INFLUENTIAL_CATEGORY_LABELS, type InfluentialCategory } from '../../types/influential';

const CATEGORIES: InfluentialCategory[] = [
  'business_leader',
  'cto',
  'engineering_leader',
  'open_source_contributor',
  'product_leader',
  'designer',
  'researcher',
];

export function InfluentialDirectory() {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<InfluentialCategory[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'name'>('score');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadProfessionals();
  }, [selectedCategories, sortBy, page]);

  const loadProfessionals = async () => {
    setLoading(true);
    const result = await getInfluentialProfessionals({
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      page,
      limit,
    });
    setProfessionals(result.data);
    setTotal(result.total);
    setLoading(false);
  };

  const handleCategoryToggle = (category: InfluentialCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const filteredProfessionals = professionals.filter(prof => {
    if (!searchQuery) return true;
    const name = prof.profiles?.full_name?.toLowerCase() || '';
    const title = prof.profiles?.job_title?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ paddingTop: '240px' }} className="bg-transparent pb-12">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="h-12 w-12 text-[#32f08c]" />
            <h1 className="text-4xl md:text-5xl font-bold !text-white" style={{ color: '#FFFFFF' }}>
              Influential Professionals
            </h1>
          </div>
          <p style={{ color: '#E2E8F0', fontSize: '20px' }} className="mb-2 font-medium">
            Meet the leaders shaping the future across industries
          </p>
          <p style={{ color: '#CBD5E1' }} className="font-medium">
            Curated professionals recognized for their exceptional achievements and contributions
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8"
        >
          <Card className="bg-white/5 border-white/10 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '64px' }} className="mb-2 !text-white !opacity-100">{total}</div>
              <div style={{ color: '#32f08c' }} className="font-bold text-[10px] uppercase tracking-[0.2em] !text-[#32f08c]">Professionals</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '64px' }} className="mb-2 !text-white !opacity-100">{CATEGORIES.length}</div>
              <div style={{ color: '#32f08c' }} className="font-bold text-[10px] uppercase tracking-[0.2em] !text-[#32f08c]">Categories</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '64px' }} className="mb-2 !text-white !opacity-100">100%</div>
              <div style={{ color: '#32f08c' }} className="font-bold text-[10px] uppercase tracking-[0.2em] !text-[#32f08c]">Verified</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/5 border-white/10 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-[#32f08c]" />
                  <h3 style={{ color: '#FFFFFF' }} className="text-lg font-bold">Filters</h3>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label style={{ color: '#F1F5F9' }} className="text-xs font-bold mb-2 block uppercase tracking-widest">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#F1F5F9', opacity: 0.6 }} />
                    <Input
                      placeholder="Search by name or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      style={{ color: '#FFFFFF' }}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label style={{ color: '#F1F5F9' }} className="text-xs font-bold mb-3 block uppercase tracking-widest">Categories</label>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border ${
                          selectedCategories.includes(category)
                            ? 'bg-[#32f08c]/20 border-[#32f08c]/50 shadow-[0_0_15px_rgba(50,240,140,0.1)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span 
                          style={{ color: selectedCategories.includes(category) ? '#32f08c' : '#F1F5F9' }} 
                          className="text-sm font-bold"
                        >
                          {INFLUENTIAL_CATEGORY_LABELS[category]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label style={{ color: '#F1F5F9' }} className="text-xs font-bold mb-2 block uppercase tracking-widest">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Influence Score</SelectItem>
                      <SelectItem value="recent">Recently Joined</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {selectedCategories.length > 0 && (
                  <Button
                    onClick={() => setSelectedCategories([])}
                    variant="outline"
                    className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Professionals Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-40 bg-white/10 rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                <Users className="h-20 w-20 mx-auto mb-4" style={{ color: '#32f08c', opacity: 0.3 }} />
                <h3 style={{ color: '#FFFFFF' }} className="text-2xl font-bold mb-2">No professionals found</h3>
                <p style={{ color: '#CBD5E1' }} className="font-medium">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {filteredProfessionals.map((prof, index) => (
                    <motion.div
                      key={prof.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-[#32f08c]/30 transition-all cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-16 w-16 border-2 border-[#32f08c]/30">
                              <AvatarImage src={prof.profiles?.avatar_url} />
                              <AvatarFallback className="bg-white/10 text-white">
                                {prof.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 style={{ color: '#FFFFFF' }} className="text-lg font-bold mb-1 truncate group-hover:text-[#32f08c] transition-colors">
                                {prof.profiles?.full_name || 'Anonymous'}
                              </h3>
                              <p style={{ color: '#CBD5E1' }} className="text-sm font-semibold mb-2 truncate">
                                {prof.profiles?.job_title || 'Professional'}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-3.5 w-3.5" style={{ color: '#32f08c' }} />
                                <span style={{ color: '#CBD5E1' }} className="font-medium">{prof.profiles?.city || prof.profiles?.country || 'Location not specified'}</span>
                              </div>
                            </div>
                            <InfluentialBadge variant="icon" size="sm" />
                          </div>

                          {/* Bio snippet */}
                          {prof.bio_headline && (
                            <p style={{ color: '#E2E8F0' }} className="text-sm mb-4 line-clamp-2">
                              {prof.bio_headline}
                            </p>
                          )}

                          {/* Categories */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {prof.categories?.slice(0, 3).map((cat: InfluentialCategory) => (
                              <Badge key={cat} variant="outline" className="bg-white/5 border-white/20 !text-white text-xs">
                                {INFLUENTIAL_CATEGORY_LABELS[cat]}
                              </Badge>
                            ))}
                          </div>

                          {/* Influence Score */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-[#32f08c]" />
                              <span style={{ color: '#CBD5E1' }} className="text-sm font-medium">Influence Score</span>
                            </div>
                            <span style={{ color: '#32f08c' }} className="font-bold">{prof.influence_score || 0}</span>
                          </div>

                          {/* View Profile Button */}
                          <Button
                            onClick={() => navigate(`/profile/${prof.user_id}`)}
                            className="w-full mt-4 bg-white/5 hover:bg-[#32f08c]/20 text-white border border-white/10 hover:border-[#32f08c]/30"
                          >
                            View Profile
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                      className="border-white/20 !text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="!text-white font-medium px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      variant="outline"
                      className="border-white/20 !text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
