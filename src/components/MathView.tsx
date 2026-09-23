import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      // Strip outer delimiters if present e.g. $$...$$ or \(...\)
      let cleaned = math.trim();
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1).trim();
      } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.slice(2, -2).trim();
      }

      return katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return '';
    }
  }, [math, displayMode]);

  if (!html) {
    return <span className={`font-mono text-cyan-300 ${className}`}>{math}</span>;
  }

  return (
    <span
      className={`inline-block max-w-full align-middle break-words whitespace-normal ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Component to parse and render mixed text containing $...$ or \\(...\\) inline math
export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Split text by $...$ or \(...\)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\([\s\S]*?\\\)|\\[[\s\S]*?\\])/g;
    const tokens: { type: 'text' | 'math' | 'display'; content: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith('$$') || raw.startsWith('\\[')) {
        tokens.push({ type: 'display', content: raw });
      } else {
        tokens.push({ type: 'math', content: raw });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === 'text') {
          return <span key={idx}>{p.content}</span>;
        }
        return <MathView key={idx} math={p.content} displayMode={p.type === 'display'} />;
      })}
    </span>
  );
};
