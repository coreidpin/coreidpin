import { supabaseUrl } from './supabase/client';
import { ensureValidSession } from './session';
import type { RequestEndorsementForm, ProfessionalEndorsement } from '../types/endorsement';

/**
 * Request endorsement using server endpoint (bypasses RLS with service role)
 * Use this instead of the direct Supabase insert to avoid RLS errors
 */
export async function requestEndorsementViaServer(
  data: RequestEndorsementForm
): Promise<{ success: boolean; endorsement?: ProfessionalEndorsement; error?: string }> {
  try {
    // Get current session with automatic refresh if needed
    const accessToken = await ensureValidSession();
    
    if (!accessToken) {
      throw new Error('Not authenticated - Please log in again');
    }

    // Call server endpoint (uses service role to bypass RLS)
    const response = await fetch(`${supabaseUrl}/functions/v1/server/endorsements/request-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request endorsement');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to request endorsement');
    }

    return { success: true, endorsement: result.endorsement as ProfessionalEndorsement };
  } catch (error: any) {
    console.error('Failed to request endorsement:', error);
    return { success: false, error: error.message };
  }
}
