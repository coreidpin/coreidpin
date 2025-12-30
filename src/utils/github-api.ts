/**
 * GitHub API Integration
 * Fetch repository stats and contribution data
 */

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string;
  description: string;
  lastUpdated: string;
  topics: string[];
}

export interface GitHubContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Extract owner and repo from GitHub URL
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    }
  }

  return null;
}

/**
 * Fetch repository stats from GitHub API
 * Note: GitHub API has rate limits (60 requests/hour for unauthenticated)
 */
export async function fetchGitHubRepoStats(
  repoUrl: string
): Promise<GitHubRepoStats | null> {
  try {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      console.error('Invalid GitHub URL:', repoUrl);
      return null;
    }

    const { owner, repo } = parsed;
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error('GitHub API error:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.watchers_count || 0,
      openIssues: data.open_issues_count || 0,
      language: data.language || 'Unknown',
      description: data.description || '',
      lastUpdated: data.updated_at,
      topics: data.topics || [],
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return null;
  }
}

/**
 * Fetch user contribution data from GitHub
 * Note: This is a simplified version. Real GitHub contribution graph
 * requires scraping or using GitHub GraphQL API
 */
export async function fetchGitHubContributions(
  username: string,
  year?: number
): Promise<GitHubContribution[]> {
  try {
    // GitHub doesn't provide a public REST API for contribution graph
    // This would typically require:
    // 1. GitHub GraphQL API with authentication
    // 2. Or scraping the user's GitHub profile page
    // For now, return mock data structure
    
    const currentYear = year || new Date().getFullYear();
    const contributions: GitHubContribution[] = [];
    
    // Generate dates for the past year
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: 0,
        level: 0,
      });
    }

    return contributions;
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return [];
  }
}

/**
 * Fetch user's public repositories
 */
export async function fetchUserRepos(username: string) {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const repos = await response.json();
    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      updatedAt: repo.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching user repos:', error);
    return [];
  }
}

/**
 * Check if GitHub API is available and rate limit status
 */
export async function checkGitHubApiStatus(): Promise<{
  available: boolean;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}> {
  try {
    const response = await fetch('https://api.github.com/rate_limit');
    
    if (!response.ok) {
      return { available: false };
    }

    const data = await response.json();
    const coreRate = data.resources.core;

    return {
      available: true,
      rateLimit: {
        limit: coreRate.limit,
        remaining: coreRate.remaining,
        reset: new Date(coreRate.reset * 1000),
      },
    };
  } catch (error) {
    return { available: false };
  }
}
