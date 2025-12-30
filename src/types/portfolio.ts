/**
 * Portfolio Feature Types
 * TypeScript definitions for case studies, tech stack, projects, and product launches
 */

// ============================================
// SHARED TYPES
// ============================================

export interface Metric {
  label: string;
  value: string | number;
  change?: number;
  changeDirection?: 'up' | 'down';
  icon?: string;
  color?: string;
}

export interface Link {
  title: string;
  url: string;
  source?: string;
  date?: string;
}

export interface Testimonial {
  text: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  date?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
  description?: string;
  imageUrl?: string;
}

export interface ImageGallery {
  url: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

// ============================================
// DESIGNER TYPES - CASE STUDIES
// ============================================

export interface DesignAnnotation {
  x: number; // percentage
  y: number; // percentage
  title: string;
  description: string;
}

export interface DesignIteration {
  version: string;
  description: string;
  images: ImageGallery[];
  learnings?: string;
}

export interface ComponentShowcase {
  name: string;
  description: string;
  images: ImageGallery[];
  figmaUrl?: string;
}

export interface CaseStudyProblem {
  statement: string;
  context: string;
  constraints: string[];
}

export interface CaseStudyProcess {
  research: string;
  ideation: string;
  wireframes: ImageGallery[];
  iterations: DesignIteration[];
}

export interface CaseStudySolution {
  finalDesigns: ImageGallery[];
  designSystem?: ComponentShowcase;
  prototype?: string;
  videoUrl?: string;
  annotations: DesignAnnotation[];
}

export interface CaseStudyImpact {
  metrics: Metric[];
  testimonials: string[];
  awards: Award[];
}

export interface CaseStudy {
  id: string;
  userId: string;
  title: string;
  slug: string;
  coverImage?: string;
  client: string;
  year: string;
  
  // Content sections
  problem: CaseStudyProblem;
  process: CaseStudyProcess;
  solution: CaseStudySolution;
  impact: CaseStudyImpact;
  
  // Meta
  tags: string[];
  tools: string[];
  role: string;
  teamSize?: number;
  
  // Status
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export type CaseStudyFormData = Omit<CaseStudy, 'id' | 'userId' | 'slug' | 'viewCount' | 'createdAt' | 'updatedAt'>;

// ============================================
// ENGINEER TYPES - TECH STACK & PROJECTS
// ============================================

export type SkillCategory = 'language' | 'framework' | 'tool' | 'database' | 'cloud' | 'other';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface TechSkill {
  id: string;
  userId: string;
  category: SkillCategory;
  name: string;
  level: SkillLevel;
  yearsExperience: number;
  projectCount: number;
  percentage?: number;
  lastUsedAt?: string;
  displayOrder: number;
  endorsementCount?: number;
  hasEndorsed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechStackDistribution {
  category: SkillCategory;
  skills: Array<{
    name: string;
    percentage: number;
    level: SkillLevel;
  }>;
}

export interface ProjectImpact {
  usersServed?: number;
  performanceGain?: string;
  scalability?: string;
  testCoverage?: number;
  customMetrics?: Metric[];
}

export type ProjectStatus = 'Production' | 'Beta' | 'Archived' | 'In Progress';

export interface EngineeringProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  liveDemoUrl?: string;
  coverImage?: string;
  screenshots: string[];
  
  // Impact
  impact: ProjectImpact;
  
  // Project meta
  role: string;
  duration: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  
  // Status
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = Omit<EngineeringProject, 'id' | 'userId' | 'viewCount' | 'createdAt' | 'updatedAt'>;

// ============================================
// PM TYPES - PRODUCT LAUNCHES & ARTICLES
// ============================================

export interface ProductNarrative {
  problem: string;
  vision: string;
  strategy: string;
  execution: string;
}

export interface ProductImpact {
  userMetrics: Metric[];
  businessMetrics: Metric[];
  culturalImpact?: string;
  awards: Award[];
}

export interface ProductLaunch {
  id: string;
  userId: string;
  productName: string;
  company: string;
  launchDate: string;
  coverImage?: string;
  
  // Content
  narrative: ProductNarrative;
  impact: ProductImpact;
  
  // Supporting content
  pressLinks: Link[];
  demoVideo?: string;
  testimonials: Testimonial[];
  
  // Meta
  role: string;
  team: string;
  tags: string[];
  
  // Status
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export type ProductLaunchFormData = Omit<ProductLaunch, 'id' | 'userId' | 'viewCount' | 'createdAt' | 'updatedAt'>;

export type ArticlePlatform = 'Medium' | 'LinkedIn' | 'Personal Blog' | 'Company Blog' | 'Substack' | 'Dev.to';

export interface Article {
  id: string;
  userId: string;
  title: string;
  summary: string;
  url: string;
  thumbnail?: string;
  platform: ArticlePlatform;
  publishedAt: string;
  topic: string;
  
  // Engagement
  views: number;
  likes: number;
  comments: number;
  
  isFeatured: boolean;
  createdAt: string;
}

export type ArticleFormData = Omit<Article, 'id' | 'userId' | 'views' | 'likes' | 'comments' | 'createdAt'>;

// ============================================
// FEATURED ITEMS (Cross-Role)
// ============================================

export type FeaturedItemType = 'case_study' | 'project' | 'product_launch' | 'article' | 'custom';

export interface FeaturedItem {
  id: string;
  userId: string;
  itemType: FeaturedItemType;
  itemId?: string;
  
  // Custom featured item (if not referencing another table)
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  customLink?: string;
  
  displayOrder: number;
  createdAt: string;
}

export interface PopulatedFeaturedItem extends FeaturedItem {
  // When fetched with join
  item?: CaseStudy | EngineeringProject | ProductLaunch | Article;
}

export type FeaturedItemFormData = Omit<FeaturedItem, 'id' | 'userId' | 'createdAt'>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FORM STATE TYPES
// ============================================

export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface PortfolioFilters {
  userId?: string;
  tags?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  search?: string;
}

export type SortField = 'createdAt' | 'updatedAt' | 'viewCount' | 'title' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface PortfolioStats {
  caseStudies: number;
  projects: number;
  productLaunches: number;
  articles: number;
  totalViews: number;
  featuredItems: number;
}

export interface TechStackStats {
  totalSkills: number;
  distribution: TechStackDistribution[];
  topSkills: TechSkill[];
  recentlyUsed: TechSkill[];
}
