import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Video, 
  Mail,
  X,
  ChevronRight,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of GidiPIN',
      color: 'from-blue-500 to-blue-600',
      articles: [
        'How to generate your PIN',
        'Complete your profile',
        'Verify your identity',
        'Share your PIN'
      ]
    },
    {
      icon: MessageCircle,
      title: 'PIN Management',
      description: 'Manage your professional PIN',
      color: 'from-green-500 to-green-600',
      articles: [
        'Regenerate your PIN',
        'PIN security tips',
        'Who can see my PIN',
        'PIN usage analytics'
      ]
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      color: 'from-purple-500 to-purple-600',
      articles: [
        'Dashboard overview',
        'Adding projects',
        'Request endorsements',
        'Profile optimization'
      ]
    }
  ];

  const quickActions = [
    {
      icon: Mail,
      title: 'Contact Support',
      description: 'Get help from our team',
      action: () => window.location.href = 'mailto:support@gidipin.com'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us now',
      action: () => console.log('Open chat')
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Help Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Help Center</h2>
                    <p className="text-sm text-blue-100">We're here to help</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Help Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Browse Topics</h3>
                {helpCategories.map((category, index) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <category.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{category.title}</h4>
                            <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                            <div className="space-y-1">
                              {category.articles.slice(0, 2).map((article) => (
                                <div key={article} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                  <ChevronRight className="h-4 w-4" />
                                  <span>{article}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Need More Help?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      onClick={action.action}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <action.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{action.title}</div>
                          <div className="text-sm text-gray-500">{action.description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600 mb-4">Find quick answers to common questions</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View All FAQs
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
