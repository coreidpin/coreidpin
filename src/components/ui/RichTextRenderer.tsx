import React from 'react';

interface RichTextRendererProps {
  content?: string;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  if (!content) return null;

  // Split by newlines
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    // List item
    if (line.trim().startsWith('- ')) {
      return (
        <li key={index} className="ml-4 list-disc pl-2 mb-1">
          {parseInline(line.replace('- ', ''))}
        </li>
      );
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">
          {parseInline(line.replace('> ', ''))}
        </blockquote>
      );
    }
    
    // Header
    if (line.trim().startsWith('# ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-gray-900">{parseInline(line.replace('# ', ''))}</h3>;
    }

    // Empty paragraph
    if (line.trim() === '') {
      return <div key={index} className="h-4"></div>;
    }

    // Standard paragraph
    return (
      <p key={index} className="mb-2 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  };

  const parseInline = (text: string) => {
    // Simplistic parser for **bold** and *italic*
    // This is NOT a full markdown parser, just a lightweight helper
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g); // Split by markers

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className={className}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  );
};
