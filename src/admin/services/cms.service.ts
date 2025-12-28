import { supabase } from '../../utils/supabase/client';

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at: string | null;
  author_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CMSFAQ {
  id: string;
  question: string;
  answer: string;
  category_id: string | null;
  display_order: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'page' | 'faq' | 'help';
  parent_id: string | null;
  display_order: number;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export class CMSService {
  // ==================== PAGES ====================
  
  async getPages(filters?: { status?: string; category_id?: string }): Promise<CMSPage[]> {
    let query = supabase
      .from('cms_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getPageById(id: string): Promise<CMSPage | null> {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getPageBySlug(slug: string): Promise<any | null> {
    const { data, error } = await supabase
      .rpc('get_page_by_slug', { p_slug: slug })
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createPage(page: Partial<CMSPage>): Promise<CMSPage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cms_pages')
      .insert({
        ...page,
        author_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePage(id: string, updates: Partial<CMSPage>): Promise<CMSPage> {
    const { data, error } = await supabase
      .from('cms_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async publishPage(id: string): Promise<CMSPage> {
    return this.updatePage(id, {
      status: 'published',
      published_at: new Date().toISOString()
    } as Partial<CMSPage>);
  }

  // ==================== FAQs ====================

  async getFAQs(filters?: { status?: string; category_id?: string }): Promise<CMSFAQ[]> {
    let query = supabase
      .from('cms_faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createFAQ(faq: Partial<CMSFAQ>): Promise<CMSFAQ> {
    const { data, error } = await supabase
      .from('cms_faqs')
      .insert(faq)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFAQ(id: string, updates: Partial<CMSFAQ>): Promise<CMSFAQ> {
    const { data, error } = await supabase
      .from('cms_faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFAQ(id: string): Promise<void> {
    const { error } = await supabase
      .from('cms_faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderFAQs(updates: Array<{ id: string; display_order: number }>): Promise<void> {
    for (const update of updates) {
      await this.updateFAQ(update.id, { display_order: update.display_order });
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories(type?: 'page' | 'faq' | 'help'): Promise<CMSCategory[]> {
    let query = supabase
      .from('cms_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createCategory(category: Partial<CMSCategory>): Promise<CMSCategory> {
    const { data, error } = await supabase
      .from('cms_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<CMSCategory>): Promise<CMSCategory> {
    const { data, error } = await supabase
      .from('cms_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('cms_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ==================== SEARCH ====================

  async searchContent(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('search_cms_content', { p_query: query });

    if (error) throw error;
    return data || [];
  }

  // ==================== ANALYTICS ====================

  async trackPageView(pageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.rpc('track_page_view', {
      p_page_id: pageId,
      p_user_id: user?.id || null
    });
  }

  async markFAQHelpful(faqId: string, isHelpful: boolean): Promise<void> {
    await supabase.rpc('mark_faq_helpful', {
      p_faq_id: faqId,
      p_is_helpful: isHelpful
    });
  }

  // ==================== BLOG POSTS ====================

  async getBlogPosts(params?: { limit?: number; offset?: number; category_id?: string }): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_published_blog_posts', {
      p_limit: params?.limit || 10,
      p_offset: params?.offset || 0,
      p_category_id: params?.category_id || null
    });

    if (error) throw error;
    return data || [];
  }

  async getBlogPostBySlug(slug: string): Promise<any | null> {
    const { data, error } = await supabase
      .rpc('get_blog_post_by_slug', { p_slug: slug })
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async likeBlogPost(postId: string): Promise<void> {
    await supabase.rpc('like_blog_post', { p_post_id: postId });
  }

  async createBlogPost(post: any): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cms_blog_posts')
      .insert({
        ...post,
        author_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlogPost(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlogPost(id: string): Promise<void> {
    const { error } = await supabase
      .from('cms_blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async publishBlogPost(id: string): Promise<any> {
    return this.updateBlogPost(id, {
      status: 'published',
      published_at: new Date().toISOString()
    });
  }

  // ==================== SUCCESS STORIES ====================

  async getSuccessStories(params?: { limit?: number; industry?: string; use_case?: string }): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_published_stories', {
      p_limit: params?.limit || 20,
      p_industry: params?.industry || null,
      p_use_case: params?.use_case || null
    });

    if (error) throw error;
    return data || [];
  }

  async createSuccessStory(story: any): Promise<any> {
    const { data, error } = await supabase
      .from('success_stories')
      .insert(story)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const cmsService = new CMSService();
