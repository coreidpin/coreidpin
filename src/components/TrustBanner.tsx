import React from 'react';
import { Shield, Users, Building, GraduationCap, Globe } from 'lucide-react';

type Metric = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface TrustBannerProps {
  title?: string;
  description?: string;
  metrics?: Metric[];
  className?: string;
}

const defaultMetrics: Metric[] = [
  { label: 'Verified Professionals', value: '50,000+', icon: Users },
  { label: 'Global Employers', value: '2,500+', icon: Building },
  { label: 'Partner Universities', value: '150+', icon: GraduationCap },
  { label: 'Countries Served', value: '45+', icon: Globe },
];

export function TrustBanner({
  title = 'Verified & Compliant Talents Only',
  description = 'Every professional on our platform undergoes rigorous KYC, AML, and sanctions screening. Your hiring process is secure, compliant, and globally recognized.',
  metrics = defaultMetrics,
  className = '',
}: TrustBannerProps) {
  return (
    <div className={`bg-primary/5 border-t border-border ${className}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="text-2xl sm:text-3xl font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <metric.icon className="h-10 w-10 text-primary mx-auto mb-2" />
                <div className="text-3xl sm:text-4xl font-extrabold text-primary">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrustBanner;