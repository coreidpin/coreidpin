import React, { useState, useEffect } from 'react';
import { Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cmsService, CMSFAQ, CMSCategory } from '../admin/services/cms.service';
import { toast } from 'sonner';

export function FAQPage() {
  const [faqs, setFaqs] = useState<CMSFAQ[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqData, categoryData] = await Promise.all([
        cmsService.getFAQs({ 
          status: 'published',
          category_id: selectedCategory || undefined 
        }),
        cmsService.getCategories('faq')
      ]);
      setFaqs(faqData);
      setCategories(categoryData);
    } catch (error: any) {
      console.error('Failed to load FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (faqId: string, isHelpful: boolean) => {
    try {
      await cmsService.markFAQHelpful(faqId, isHelpful);
      toast.success('Thank you for your feedback!');
      loadData();
    } catch (error: any) {
      toast.error('Failed to submit feedback');
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about GidiPIN
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading FAQs...</p>
            </div>
          ) : filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">
                  {searchQuery
                    ? 'No FAQs found matching your search.'
                    : 'No FAQs available yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">
                        {faq.question}
                      </h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{faq.answer}</p>

                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Was this helpful?</span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleMarkHelpful(faq.id, true)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Yes ({faq.helpful_count})
                          </Button>
                          <Button
                            onClick={() => handleMarkHelpful(faq.id, false)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            No ({faq.not_helpful_count})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for? Contact our support team.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
