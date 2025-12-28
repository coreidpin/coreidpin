import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Clock, Heart, Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cmsService } from '../admin/services/cms.service';
import { toast } from 'sonner';

export function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getBlogPosts({ limit: 20 });
      setPosts(data);
    } catch (error: any) {
      console.error('Failed to load blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  const featuredPost = posts.find(p => p.is_featured);
  const regularPosts = filteredPosts.filter(p => !p.is_featured || p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#bfa5ff', color: '#0a0b0d', border: 'none' }}>
              Blog
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Insights & Updates
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              The latest news, insights, and updates from the GidiPIN team
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && !searchQuery && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-6">Featured</h2>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Card className="overflow-hidden border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="grid md:grid-cols-2">
                        {featuredPost.featured_image && (
                          <div 
                            className="h-64 md:h-auto bg-cover bg-center"
                            style={{ backgroundImage: `url(${featuredPost.featured_image})` }}
                          />
                        )}
                        <CardContent className="p-8">
                          <Badge className="mb-4" style={{ backgroundColor: '#7bb8ff', color: '#fff' }}>
                            {featuredPost.category_name || 'Article'}
                          </Badge>
                          <h3 className="text-3xl font-bold mb-4">{featuredPost.title}</h3>
                          <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(featuredPost.published_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {featuredPost.read_time_minutes} min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {featuredPost.likes}
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <Card className="h-full overflow-hidden border-gray-200 hover:shadow-xl transition-shadow">
                        {post.featured_image && (
                          <div 
                            className="h-48 bg-cover bg-center"
                            style={{ backgroundImage: `url(${post.featured_image})` }}
                          />
                        )}
                        <CardContent className="p-6">
                          <Badge className="mb-3" style={{ backgroundColor: '#bfa5ff', color: '#fff' }}>
                            {post.category_name || 'Article'}
                          </Badge>
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{post.excerpt}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.published_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.read_time_minutes}min
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {regularPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    {searchQuery ? 'No articles found matching your search.' : 'No articles published yet.'}
                  </p>
                </div>
              )}
           </>
          )}
        </div>
      </section>
    </div>
  );
}
