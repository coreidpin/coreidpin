import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface CompanyLogoProps {
  companyName: string;
  companyId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  companyId,
  size = 'md',
  className = '',
  showTooltip = true
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!companyName) {
        setLoading(false);
        return;
      }

      try {
        // Try to find company by name
        console.log('[CompanyLogo] Fetching logo for:', companyName);
        const { data, error } = await supabase
          .rpc('find_company', { company_name: companyName });

        console.log('[CompanyLogo] RPC result:', { data, error });
        if (error) {
          console.error('[CompanyLogo] Full error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
        }

        if (!error && data && data.length > 0 && data[0].logo_url) {
          console.log('[CompanyLogo] Found logo URL:', data[0].logo_url);
          setLogoUrl(data[0].logo_url);
        } else if (companyId) {
          // Fallback: try by ID
          console.log('[CompanyLogo] Trying fallback by ID:', companyId);
          const { data: companyData } = await supabase
            .from('companies')
            .select('logo_url')
            .eq('id', companyId)
            .single();

          if (companyData?.logo_url) {
            console.log('[CompanyLogo] Found logo via ID:', companyData.logo_url);
            setLogoUrl(companyData.logo_url);
          } else {
            console.log('[CompanyLogo] No logo found');
          }
        } else {
          console.log('[CompanyLogo] No logo found in RPC result');
        }
      } catch (error) {
        console.error('[CompanyLogo] Error fetching company logo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyLogo();
  }, [companyName, companyId]);

  if (loading) {
    return (
      <div className={`${sizes[size]} rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center animate-pulse shadow-md ${className}`}>
        <div className={`${iconSizes[size]} bg-gray-300 rounded`} />
      </div>
    );
  }

  if (!logoUrl) {
    // Fallback icon
    return (
      <div 
        className={`${sizes[size]} rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}
        title={showTooltip ? companyName : undefined}
      >
        <Building2 className={`${iconSizes[size]} text-gray-400`} />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className={`${sizes[size]} rounded-2xl border-2 border-gray-100 object-contain bg-white p-2 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-gray-200 ring-0 hover:ring-4 hover:ring-gray-100/50`}
        loading="lazy"
        onError={(e) => {
          // Fallback to icon on error
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${sizes[size]} rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-md">
                <svg class="${iconSizes[size]} text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
              </div>
            `;
          }
        }}
      />
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {companyName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;
