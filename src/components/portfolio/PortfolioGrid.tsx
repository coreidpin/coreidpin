import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ImageIcon } from 'lucide-react';
import type { Project } from '@/types/dashboard';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  showFilters?: boolean;
}

export function PortfolioGrid({ projects, onProjectClick, showFilters = true }: PortfolioGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => p.is_portfolio_visible !== false);

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.project_type === filterType);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.skills?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [projects, filterType, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="case_study">Case Studies</TabsTrigger>
              <TabsTrigger value="portfolio_item">Portfolio Items</TabsTrigger>
              <TabsTrigger value="basic">Basic Projects</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
      </div>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <PortfolioCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => onProjectClick(project)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No projects found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      )}
    </div>
  );
}
