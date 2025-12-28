import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cmsService } from '../admin/services/cms.service';
import { toast } from 'sonner';

export function CMSPageViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      setNotFound(false);
      const data = await cmsService.getPageBySlug(pageSlug);
      
      if (data) {
        setPage(data);
        // Track page view
        await cmsService.trackPageView(data.id);
        
        // Set page title and meta tags
        if (data.meta_title) {
          document.title = data.meta_title;
        } else {
          document.title = `${data.title} | GidiPIN`;
        }
        
        if (data.meta_description) {
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', data.meta_description);
        }
      } else {
        setNotFound(true);
      }
    } catch (error: any) {
      console.error('Failed to load page:', error);
      setNotFound(true);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Page Content */}
        <Card>
          <CardContent className="p-8 lg:p-12">
            {/* Header */}
            <header className="mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {page.title}
              </h1>
              
              {page.excerpt && (
                <p className="text-xl text-gray-600 mb-6">
                  {page.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {page.category_name && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    {page.category_name}
                  </span>
                )}
                
                {page.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(page.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
                
                {page.updated_at && new Date(page.updated_at).getTime() !== new Date(page.published_at).getTime() && (
                  <span className="text-gray-400">
                    Updated {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </header>

            {/* Content */}
            <article className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatContent(page.content) }}
              />
            </article>
          </CardContent>
        </Card>

        {/* Related or Additional Info */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Need more help?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check out our FAQ page or contact support.
                  </p>
                </div>
                <Link to="/faq">
                  <Button variant="outline">
                    View FAQs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to format content (basic markdown-like formatting)
function formatContent(content: string): string {
  if (!content) return '';
  
  // Convert line breaks to <br>
  let formatted = content.replace(/\n/g, '<br>');
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert [link](url) to <a>
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
  
  // Convert # headings
  formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold mt-6 mb-4">$1</h3>');
  formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>');
  formatted = formatted.replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>');
  
  return formatted;
}
