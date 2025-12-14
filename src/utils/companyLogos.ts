import { supabase } from './supabase/client';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  name_lowercase: string;
  logo_url: string | null;
  website?: string;
  industry?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  verified: boolean;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Find company by name (case-insensitive)
 */
export const findCompany = async (companyName: string): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .rpc('find_company', { company_name: companyName });

    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error finding company:', error);
    return null;
  }
};

/**
 * Create a new company entry
 */
export const createCompany = async (
  companyName: string,
  userId: string
): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyName.trim(),
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate - fetch existing
      if (error.code === '23505') {
        return await findCompany(companyName);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
};

/**
 * Upload company logo
 */
export const uploadCompanyLogo = async (
  companyId: string,
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return null;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Logo must be PNG, JPG, SVG, or WebP');
      return null;
    }

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);

    // Update company record
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        logo_url: publicUrl,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    toast.error('Failed to upload logo');
    return null;
  }
};

/**
 * Try to auto-fetch company logo from Clearbit
 */
export const autoFetchCompanyLogo = async (
  companyName: string,
  website?: string
): Promise<string | null> => {
  try {
    // Try Clearbit Logo API
    const domain = website || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;

    // Test if logo exists
    const response = await fetch(clearbitUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return clearbitUrl;
    }

    return null;
  } catch (error) {
    console.error('Error auto-fetching logo:', error);
    return null;
  }
};

/**
 * Get or create company with auto-fetch
 */
export const getOrCreateCompany = async (
  companyName: string,
  userId: string,
  website?: string
): Promise<{ company: Company; isNew: boolean }> => {
  // Try to find existing company
  let company = await findCompany(companyName);

  if (company) {
    return { company, isNew: false };
  }

  // Create new company
  company = await createCompany(companyName, userId);
  
  if (!company) {
    throw new Error('Failed to create company');
  }

  // Try to auto-fetch logo
  const autoFetchedLogo = await autoFetchCompanyLogo(companyName, website);
  
  if (autoFetchedLogo) {
    // Update company with auto-fetched logo
    await supabase
      .from('companies')
      .update({ 
        logo_url: autoFetchedLogo,
        uploaded_at: new Date().toISOString()
      })
      .eq('id', company.id);

    company.logo_url = autoFetchedLogo;
  }

  return { company, isNew: true };
};

/**
 * Increment employee count for a company
 */
export const incrementEmployeeCount = async (companyId: string): Promise<void> => {
  try {
    await supabase.rpc('increment_company_employees', { company_id: companyId });
  } catch (error) {
    console.error('Error incrementing employee count:', error);
  }
};

/**
 * Get companies with most employees (for suggestions)
 */
export const getPopularCompanies = async (limit = 10): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('employee_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching popular companies:', error);
    return [];
  }
};

/**
 * Search companies
 */
export const searchCompanies = async (query: string, limit = 5): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('employee_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
};
