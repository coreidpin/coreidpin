import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Edit, Trash2, Eye, EyeOff, 
  Save, X, HelpCircle, Folder, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cmsService, CMSPage, CMSFAQ, CMSCategory } from '../services/cms.service';
import { toast } from 'sonner';

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'pages' | 'faqs' | 'categories'>('pages');
  const [loading, setLoading] = useState(false);

  // Pages state
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [editingPage, setEditingPage] = useState<Partial<CMSPage> | null>(null);
  const [showPageEditor, setShowPageEditor] = useState(false);

  // FAQs state
  const [faqs, setFAQs] = useState<CMSFAQ[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<Partial<CMSFAQ> | null>(null);
  const [showFAQEditor, setShowFAQEditor] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<CMSCategory> | null>(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pages') {
        const data = await cmsService.getPages();
        setPages(data);
      } else if (activeTab === 'faqs') {
        const data = await cmsService.getFAQs();
        setFAQs(data);
      } else {
        const data = await cmsService.getCategories();
        setCategories(data);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PAGE FUNCTIONS ====================

  const savePage = async () => {
    if (!editingPage) return;

    try {
      if (editingPage.id) {
        await cmsService.updatePage(editingPage.id, editingPage);
        toast.success('Page updated successfully');
      } else {
        await cmsService.createPage(editingPage);
        toast.success('Page created successfully');
      }
      setShowPageEditor(false);
      setEditingPage(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save page');
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await cmsService.deletePage(id);
      toast.success('Page deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete page');
    }
  };

  const publishPage = async (id: string) => {
    try {
      await cmsService.publishPage(id);
      toast.success('Page published');
      loadData();
    } catch (error: any) {
      toast.error('Failed to publish page');
    }
  };

  // ==================== FAQ FUNCTIONS ====================

  const saveFAQ = async () => {
    if (!editingFAQ) return;

    try {
      if (editingFAQ.id) {
        await cmsService.updateFAQ(editingFAQ.id, editingFAQ);
        toast.success('FAQ updated successfully');
      } else {
        await cmsService.createFAQ(editingFAQ);
        toast.success('FAQ created successfully');
      }
      setShowFAQEditor(false);
      setEditingFAQ(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save FAQ');
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await cmsService.deleteFAQ(id);
      toast.success('FAQ deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete FAQ');
    }
  };

  // ==================== CATEGORY FUNCTIONS ====================

  const saveCategory = async () => {
    if (!editingCategory) return;

    try {
      if (editingCategory.id) {
        await cmsService.updateCategory(editingCategory.id, editingCategory);
        toast.success('Category updated successfully');
      } else {
        await cmsService.createCategory(editingCategory);
        toast.success('Category created successfully');
      }
      setShowCategoryEditor(false);
      setEditingCategory(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Associated content will be uncategorized.')) return;

    try {
      await cmsService.deleteCategory(id);
      toast.success('Category deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage pages, FAQs, and help articles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total FAQs</p>
                <p className="text-2xl font-bold">{faqs.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Pages
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faqs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQs
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Categories
          </button>
        </nav>
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pages</h2>
            <Button
              onClick={() => {
                setEditingPage({ status: 'draft' });
                setShowPageEditor(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>

          {showPageEditor ? (
            <PageEditor
              page={editingPage}
              onChange={setEditingPage}
              onSave={savePage}
              onCancel={() => {
                setShowPageEditor(false);
                setEditingPage(null);
              }}
            />
          ) : (
            <PageList
              pages={pages}
              onEdit={(page) => {
                setEditingPage(page);
                setShowPageEditor(true);
              }}
              onDelete={deletePage}
              onPublish={publishPage}
            />
          )}
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">FAQs</h2>
            <Button
              onClick={() => {
                setEditingFAQ({ status: 'published', display_order: 0 });
                setShowFAQEditor(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New FAQ
            </Button>
          </div>

          {showFAQEditor ? (
            <FAQEditor
              faq={editingFAQ}
              onChange={setEditingFAQ}
              onSave={saveFAQ}
              onCancel={() => {
                setShowFAQEditor(false);
                setEditingFAQ(null);
              }}
            />
          ) : (
            <FAQList
              faqs={faqs}
              onEdit={(faq) => {
                setEditingFAQ(faq);
                setShowFAQEditor(true);
              }}
              onDelete={deleteFAQ}
            />
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button
              onClick={() => {
                setEditingCategory({ type: 'page', display_order: 0 });
                setShowCategoryEditor(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </div>

          {showCategoryEditor ? (
            <CategoryEditor
              category={editingCategory}
              onChange={setEditingCategory}
              onSave={saveCategory}
              onCancel={() => {
                setShowCategoryEditor(false);
                setEditingCategory(null);
              }}
            />
          ) : (
            <CategoryList
              categories={categories}
              onEdit={(category) => {
                setEditingCategory(category);
                setShowCategoryEditor(true);
              }}
              onDelete={deleteCategory}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PAGE COMPONENTS ====================

function PageEditor({ page, onChange, onSave, onCancel }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{page?.id ? 'Edit Page' : 'New Page'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={page?.title || ''}
              onChange={(e) => onChange({ ...page, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Page title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={page?.slug || ''}
              onChange={(e) => onChange({ ...page, slug: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="page-slug"
            />
            <p className="text-xs text-gray-500 mt-1">URL: /pages/{page?.slug || 'page-slug'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              value={page?.content || ''}
              onChange={(e) => onChange({ ...page, content: e.target.value })}
              className="w-full border rounded px-3 py-2 h-64"
              placeholder="Page content (Markdown supported)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={page?.excerpt || ''}
              onChange={(e) => onChange({ ...page, excerpt: e.target.value })}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Short description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={page?.meta_title || ''}
                onChange={(e) => onChange({ ...page, meta_title: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="SEO title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={page?.status || 'draft'}
                onChange={(e) => onChange({ ...page, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              value={page?.meta_description || ''}
              onChange={(e) => onChange({ ...page, meta_description: e.target.value })}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="SEO description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Page
            </Button>
            <Button onClick={onCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PageList({ pages, onEdit, onDelete, onPublish }: any) {
  return (
    <div className="space-y-4">
      {pages.map((page: CMSPage) => (
        <Card key={page.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{page.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    page.status === 'published' ? 'bg-green-100 text-green-800' :
                    page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {page.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">/pages/{page.slug}</p>
                {page.excerpt && (
                  <p className="text-sm text-gray-500 mt-2">{page.excerpt}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                {page.status === 'draft' && (
                  <Button
                    onClick={() => onPublish(page.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Publish
                  </Button>
                )}
                <Button onClick={() => onEdit(page)} size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDelete(page.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {pages.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pages yet. Create your first page!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== FAQ COMPONENTS ====================

function FAQEditor({ faq, onChange, onSave, onCancel }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{faq?.id ? 'Edit FAQ' : 'New FAQ'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question *</label>
            <input
              type="text"
              value={faq?.question || ''}
              onChange={(e) => onChange({ ...faq, question: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="What is..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Answer *</label>
            <textarea
              value={faq?.answer || ''}
              onChange={(e) => onChange({ ...faq, answer: e.target.value })}
              className="w-full border rounded px-3 py-2 h-32"
              placeholder="The answer is..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={faq?.display_order || 0}
                onChange={(e) => onChange({ ...faq, display_order: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={faq?.status || 'published'}
                onChange={(e) => onChange({ ...faq, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save FAQ
            </Button>
            <Button onClick={onCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQList({ faqs, onEdit, onDelete }: any) {
  return (
    <div className="space-y-4">
      {faqs.map((faq: CMSFAQ) => (
        <Card key={faq.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>Order: {faq.display_order}</span>
                  <span>👍 {faq.helpful_count}</span>
                  <span>👎 {faq.not_helpful_count}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => onEdit(faq)} size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDelete(faq.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {faqs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No FAQs yet. Create your first FAQ!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== CATEGORY COMPONENTS ====================

function CategoryEditor({ category, onChange, onSave, onCancel }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category?.id ? 'Edit Category' : 'New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={category?.name || ''}
              onChange={(e) => onChange({ ...category, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={category?.slug || ''}
              onChange={(e) => onChange({ ...category, slug: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="category-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={category?.description || ''}
              onChange={(e) => onChange({ ...category, description: e.target.value })}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Category description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                value={category?.type || 'page'}
                onChange={(e) => onChange({ ...category, type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="page">Page</option>
                <option value="faq">FAQ</option>
                <option value="help">Help</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={category?.display_order || 0}
                onChange={(e) => onChange({ ...category, display_order: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Category
            </Button>
            <Button onClick={onCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryList({ categories, onEdit, onDelete }: any) {
  return (
    <div className="space-y-4">
      {categories.map((category: CMSCategory) => (
        <Card key={category.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{category.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {category.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-2">{category.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => onEdit(category)} size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDelete(category.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No categories yet. Create your first category!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
