import React from 'react';
import { Building2 } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Organization {
  name: string;
  logo_url?: string;
}

interface OrganizationListProps {
  workExperience: any[];
}

export const OrganizationList: React.FC<OrganizationListProps> = ({ workExperience }) => {
  // Extract unique organizations from work experience
  const organizations: Organization[] = React.useMemo(() => {
    if (!workExperience) return [];
    
    const uniqueOrgs = new Map<string, Organization>();
    
    workExperience.forEach(exp => {
      // Use company name as key to deduplicate
      const name = exp.company || exp.company_name;
      if (name && !uniqueOrgs.has(name)) {
        uniqueOrgs.set(name, {
          name: name,
          logo_url: exp.company_logo_url || exp.logo_url
        });
      }
    });

    return Array.from(uniqueOrgs.values());
  }, [workExperience]);

  if (organizations.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Organizations</h3>
      <div className="flex flex-wrap gap-2">
        {organizations.map((org, index) => (
          <div 
            key={index} 
            className="group relative"
            title={org.name}
          >
            <div className="w-10 h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all">
              {org.logo_url ? (
                <img 
                  src={org.logo_url} 
                  alt={org.name} 
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
