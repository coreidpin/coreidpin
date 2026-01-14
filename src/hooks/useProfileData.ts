import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface ProfileData {
  profile: any;
  workExperiences: any[];
  projects: any[];
  skills: any[];
  activityData: any[];
  loading: boolean;
  error: string | null;
}

export const useProfileData = (slug: string | undefined): ProfileData => {
  const [data, setData] = useState<ProfileData>({
    profile: null,
    workExperiences: [],
    projects: [],
    skills: [],
    activityData: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!slug) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    // MOCK DATA OVERRIDE FOR 'demo_user'
    if (slug === 'demo_user') {
      setTimeout(() => {
        setData({
          profile: {
            full_name: 'Akinrodolu Seun',
            profile_url_slug: 'akinrodoluseun',
            avatar_url: 'https://avatars.githubusercontent.com/u/1234567?v=4',
            bio: 'Mission driven teacher, mentor and fullstack software engineer.',
            headline: 'Senior Product Manager | Software Engineer',
            company: 'Google',
            location: 'Lagos, Nigeria',
            website: 'https://github.com/akinrodoluseun',
            email: 'seun@example.com',
            followers_count: 2400,
            following_count: 180
          },
          workExperiences: [
            { company_name: 'Tech Corp', job_title: 'Senior Product Manager', start_date: '2022-01-01' }
          ],
          projects: [
            { id: 1, title: 'Payment-page', description: 'A seamless payment integration page for fintech apps.', technologies: ['TypeScript'], project_url: '#', stars: 12, is_portfolio_visible: true },
            { id: 2, title: 'Pixel-Art-Maker', description: 'Draw pixel art in your browser.', technologies: ['JavaScript', 'HTML'], project_url: '#', stars: 8, is_portfolio_visible: true },
            { id: 3, title: 'Seun', description: 'My personal portfolio and config files.', technologies: ['HTML'], project_url: '#', stars: 10, is_portfolio_visible: true },
            { id: 4, title: 'Algorithm-Visualizer', description: 'Visualizing sorting algorithms.', technologies: ['React'], project_url: '#', stars: 45, is_portfolio_visible: true }
          ],
          skills: [
             { name: 'Jira' }, { name: 'Pendo' }, { name: 'Typeform' }, { name: 'Trello' }, { name: 'Visio' }
          ],
          activityData: [],
          loading: false,
          error: null
        });
      }, 500); // Fake delay
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const { data: profile, error: profileError } = await (supabase
          .from('profiles')
          .select('*') as any)
          .eq('profile_url_slug', slug)
          .single();

        if (profileError || !profile) {
          throw new Error('Profile not found');
        }

        const userId = profile.user_id;

        // 2. Fetch Work Experience
        const { data: workExperiences } = await supabase
          .from('work_experiences')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        // 3. Fetch Projects
        const { data: projects } = await supabase
          .from('professional_projects')
          .select('*')
          .eq('user_id', userId)
          .eq('is_portfolio_visible', true)
          .order('created_at', { ascending: false });

        // 4. Fetch Skills (Tech Stack)
        const { data: skills } = await supabase
          .from('tech_stack')
          .select('*')
          .eq('user_id', userId)
          .order('proficiency', { ascending: false }); // Assuming proficiency links to order

        // 5. Fetch Activity Data (Mock for now, or fetch from events if available)
        // For V2 launch, we might want to simulate this or fetch from a real table if populated.
        // Checking for 'profile_analytics_events'...
        const { data: analytics } = await supabase
          .from('profile_analytics_events') // Adjust table name if differ
          .select('created_at, event_type')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        // Transform analytics to heatmap format
        const activityMap = new Map<string, number>();
        analytics?.forEach((event: any) => {
            const date = event.created_at.split('T')[0];
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });

        const activityData = Array.from(activityMap.entries()).map(([date, count]) => {
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 5) level = 3;
            if (count > 10) level = 4;
            return { date, count, level: level as any };
        });

        setData({
          profile,
          workExperiences: workExperiences || [],
          projects: projects || [],
          skills: skills || [],
          activityData,
          loading: false,
          error: null
        });

      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchData();
  }, [slug]);

  return data;
};
