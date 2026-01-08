import { supabase } from './supabase/client';

export interface HRISConnectionResult {
  provider: string;
  company_name: string;
  job_title: string;
  start_date: string;
  employment_type: string;
  is_current: boolean;
}

/**
 * Exchanges the public token from Finch Connect for an access token
 * and syncs the employment data.
 */
export async function syncFinchData(publicToken: string): Promise<HRISConnectionResult> {
  const { data, error } = await supabase.functions.invoke('sync-hris-data', {
    body: { publicToken },
  });

  if (error) {
    console.error('Error syncing Finch data:', error);
    throw new Error('Failed to sync employment data');
  }

  return data as HRISConnectionResult;
}

/**
 * Mock function to satisfy the simulated frontend flow if the backend is not reachable.
 * This simulates what the Edge Function would return.
 */
export async function mockSyncFinchData(providerId: string): Promise<HRISConnectionResult> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                provider: providerId,
                company_name: providerId === 'adp' ? 'Acme Corp' : 'Tech Giant Inc',
                job_title: 'Senior Software Engineer',
                start_date: '2022-03-15',
                employment_type: 'Full-time',
                is_current: true
            });
        }, 1500);
    });
}
