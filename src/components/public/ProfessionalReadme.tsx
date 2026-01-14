import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Briefcase, Target, Sparkles } from 'lucide-react';
import { RichTextRenderer } from '../ui/RichTextRenderer';

interface ProfessionalReadmeProps {
  name: string;
  role?: string;
  bio?: string;
  specialties?: string[];
  currentFocus?: string[];
  headline?: string;
}

export const ProfessionalReadme: React.FC<ProfessionalReadmeProps> = ({
  name,
  role,
  bio,
  specialties = [],
  currentFocus = [],
  headline
}) => {
  return (
    <Card className="bg-[#0e0f12]/80 border-[#1a1b1f]/50 overflow-hidden">
      <CardContent className="p-0">
        {/* README Header - Like GitHub */}
        <div className="bg-[#161b22] px-6 py-3 border-b border-[#30363d] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177L10.513 1.573a.25.25 0 00-.177-.073H5.75a.25.25 0 00-.25.25v2.5a.75.75 0 01-1.5 0V1.75zm7.5 9.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V12a.75.75 0 01.75-.75z"></path>
          </svg>
          <span className="text-sm font-semibold text-[#c9d1d9]">README.md</span>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6 text-gray-700">
          {/* Greeting */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">👋</span>
              Hi, I'm {name}
            </h1>
            {headline && (
              <div className="text-lg text-gray-700 leading-relaxed">
                <RichTextRenderer content={headline} />
              </div>
            )}
            {!headline && role && (
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>{role}</strong> passionate about building exceptional experiences and creating value.
              </p>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="space-y-2">
              <div className="text-base text-gray-600 leading-relaxed">
                <RichTextRenderer content={bio} />
              </div>
            </div>
          )}

          {/* What I Do */}
          {specialties.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                What I Do
              </h2>
              <ul className="space-y-2 text-gray-700">
                {specialties.map((specialty, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1.5">•</span>
                    <span><RichTextRenderer content={specialty} className="inline" /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Focus */}
          {currentFocus.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Currently Focusing On
              </h2>
              <ul className="space-y-2 text-gray-700">
                {currentFocus.map((focus, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1.5">•</span>
                    <span><RichTextRenderer content={focus} className="inline" /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Open To */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>
                <strong className="text-gray-900">Open to:</strong>
                {' '}Collaboration • Consulting • Speaking Opportunities
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
