import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, TrendingUp, Users, CheckCircle, Building2, MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cmsService } from '../admin/services/cms.service';
import { toast } from 'sonner';

export function SuccessStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getSuccessStories({
        limit: 20,
        use_case: filter || undefined
      });
      setStories(data);
    } catch (error: any) {
      console.error('Failed to load stories:', error);
      toast.error('Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  const featuredStory = stories.find(s => s.is_featured);
  const regularStories = stories.filter(s => !s.is_featured || s.id !== featuredStory?.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(191,165,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(50,240,140,0.1),transparent_50%)]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#32f08c', color: '#0a0b0d', border: 'none' }}>
              Success Stories
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Real People.
              <br />
              <span style={{ color: '#32f08c' }}>Real Results.</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover how professionals and companies are transforming their work with verified identities
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'All Stories', value: null },
              { label: 'Hiring', value: 'hiring' },
              { label: 'Verification', value: 'verification' },
              { label: 'Onboarding', value: 'onboarding' }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => setFilter(btn.value)}
                className="px-6 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: filter === btn.value ? '#32f08c' : 'rgba(255,255,255,0.1)',
                  color: filter === btn.value ? '#0a0b0d' : '#fff',
                  border: filter === btn.value ? 'none' : '1px solid rgba(255,255,255,0.2)'
                }}
>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading success stories...</p>
            </div>
          ) : (
            <>
              {/* Featured Story */}
              {featuredStory && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-6">Featured Story</h2>
                  <Card className="overflow-hidden border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="p-8 lg:p-12">
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                          <Quote className="w-12 h-12 mb-6" style={{ color: '#32f08c' }} />
                          <h3 className="text-3xl font-bold mb-4">{featuredStory.title}</h3>
                          <p className="text-xl text-gray-700 mb-6 italic">"{featuredStory.quote}"</p>
                          <p className="text-gray-600 mb-6 leading-relaxed">{featuredStory.story}</p>
                          
                          {/* Person */}
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={featuredStory.person_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featuredStory.person_name}`} />
                              <AvatarFallback>{featuredStory.person_name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-lg">{featuredStory.person_name}</div>
                              <div className="text-gray-600">{featuredStory.person_title}</div>
                              <div className="text-gray-500 text-sm flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {featuredStory.person_company}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex flex-col justify-center">
                          <div className="grid gap-6">
                            {featuredStory.metric_1_value && (
                              <div className="p-6 rounded-xl bg-white border-2 border-emerald-200">
                                <div className="text-4xl font-bold mb-2" style={{ color: '#32f08c' }}>
                                  {featuredStory.metric_1_value}
                                </div>
                                <div className="text-gray-700 font-medium">{featuredStory.metric_1_label}</div>
                              </div>
                            )}
                            {featuredStory.metric_2_value && (
                              <div className="p-6 rounded-xl bg-white border-2 border-blue-200">
                                <div className="text-4xl font-bold mb-2" style={{ color: '#7bb8ff' }}>
                                  {featuredStory.metric_2_value}
                                </div>
                                <div className="text-gray-700 font-medium">{featuredStory.metric_2_label}</div>
                              </div>
                            )}
                            {featuredStory.metric_3_value && (
                              <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
                                <div className="text-4xl font-bold mb-2" style={{ color: '#bfa5ff' }}>
                                  {featuredStory.metric_3_value}
                                </div>
                                <div className="text-gray-700 font-medium">{featuredStory.metric_3_label}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Regular Stories Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {regularStories.map((story, i) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full border-gray-200 hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={story.person_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.person_name}`} />
                            <AvatarFallback>{story.person_name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">{story.person_name}</div>
                            <div className="text-sm text-gray-600">{story.person_title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" />
                              {story.person_company}
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: '#32f08c', color: '#000' }}>
                            {story.use_case}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold mb-3">{story.title}</h3>
                        <p className="text-gray-700 mb-4 italic text-sm">"{story.quote}"</p>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          {story.metric_1_value && (
                            <div className="p-3 bg-emerald-50 rounded-lg">
                              <div className="text-2xl font-bold" style={{ color: '#32f08c' }}>
                                {story.metric_1_value}
                              </div>
                              <div className="text-xs text-gray-600">{story.metric_1_label}</div>
                            </div>
                          )}
                          {story.metric_2_value && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold" style={{ color: '#7bb8ff' }}>
                                {story.metric_2_value}
                              </div>
                              <div className="text-xs text-gray-600">{story.metric_2_label}</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {stories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No success stories found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-500 to-blue-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of professionals using GidiPIN to unlock new opportunities
            </p>
            <a
              href="/get-started"
              className="inline-block px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
