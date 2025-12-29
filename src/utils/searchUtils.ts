/**
 * Search Utilities
 * Provides fuzzy search and filtering capabilities
 */

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  type: 'project' | 'endorsement' | 'activity' | 'other';
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything
  keys?: string[]; // Fields to search
  limit?: number;
}

/**
 * Simple fuzzy search implementation
 */
export function fuzzySearch(
  items: SearchableItem[],
  query: string,
  options: SearchOptions = {}
): SearchableItem[] {
  const {
    threshold = 0.4,
    keys = ['title', 'description', 'tags'],
    limit = 10
  } = options;

  if (!query || query.trim().length === 0) {
    return items.slice(0, limit);
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Score each item
  const scored = items.map(item => {
    let score = 0;
    let matches = 0;

    // Search in title (highest weight)
    if (item.title?.toLowerCase().includes(normalizedQuery)) {
      score += 10;
      matches++;
    }

    // Search in description (medium weight)
    if (item.description?.toLowerCase().includes(normalizedQuery)) {
      score += 5;
      matches++;
    }

    // Search in tags (medium weight)
    if (item.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      score += 5;
      matches++;
    }

    // Calculate fuzzy score for partial matches
    const titleScore = calculateFuzzyScore(item.title || '', normalizedQuery);
    const descScore = calculateFuzzyScore(item.description || '', normalizedQuery);
    
    score += titleScore * 3; // Title has higher weight
    score += descScore;

    return {
      item,
      score,
      matches
    };
  });

  // Filter by threshold and sort by score
  return scored
    .filter(({ score }) => score > threshold * 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * Calculate fuzzy match score
 */
function calculateFuzzyScore(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score++;
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length ? score / text.length : 0;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerm(text: string, query: string): string {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Search history manager
 */
export class SearchHistory {
  private static readonly KEY = 'search_history';
  private static readonly MAX_ITEMS = 10;

  static add(query: string): void {
    if (!query || query.trim().length === 0) return;

    const history = this.get();
    const filtered = history.filter(q => q !== query);
    filtered.unshift(query);
    
    const limited = filtered.slice(0, this.MAX_ITEMS);
    localStorage.setItem(this.KEY, JSON.stringify(limited));
  }

  static get(): string[] {
    try {
      const stored = localStorage.getItem(this.KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static remove(query: string): void {
    const history = this.get();
    const filtered = history.filter(q => q !== query);
    localStorage.setItem(this.KEY, JSON.stringify(filtered));
  }

  static clear(): void {
    localStorage.removeItem(this.KEY);
  }
}

/**
 * Filter utilities
 */
export interface FilterOption {
  id: string;
  label: string;
  value: any;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'toggle';
  options?: FilterOption[];
}

export function applyFilters<T>(
  items: T[],
  filters: Record<string, any>
): T[] {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      const itemValue = (item as any)[key];
      
      // Handle arrays (multiselect)
      if (Array.isArray(value)) {
        return value.length === 0 || value.includes(itemValue);
      }
      
      // Handle date ranges
      if (typeof value === 'object' && 'start' in value && 'end' in value) {
        const itemDate = new Date(itemValue);
        return itemDate >= value.start && itemDate <= value.end;
      }
      
      // Handle simple equality
      return itemValue === value;
    });
  });
}
