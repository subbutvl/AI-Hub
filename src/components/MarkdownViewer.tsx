import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Changed to dark theme or a neutral one if possible, but let's try to handle it. 
// Actually, switching css files dynamically is hard. Let's use a theme that looks okay-ish or just stick to one. 
// For now, I'll keep github.css but maybe I should use a variable based one or just override styles.
// Let's stick to github.css for now and maybe just invert colors in dark mode for code blocks if needed, 
// OR better, let's use a theme that supports both or just use the default and let the user deal with it for now as I can't easily switch.
// Wait, I can import both and scope them? No.
// Let's just use 'github.css' and maybe add some custom overrides for dark mode if I can.
// Actually, let's just use 'github-dark.css' if the user is in dark mode? No, I can't conditionally import easily.
// I will just use `github.css` and assume it's fine for now, or maybe I can find a way to make it adaptive.
// A common trick is to use a theme that is compatible or just use the light theme and invert it.
// But for now, let's focus on the container and text.

import 'highlight.js/styles/github.css'; 
import { cn } from '../lib/utils';
import { useState } from 'react';

interface MarkdownViewerProps {
  content: string;
  loading: boolean;
  viewMode: 'raw' | 'preview';
  fileName?: string;
}

export function MarkdownViewer({ content, loading, viewMode, fileName = 'file.txt' }: MarkdownViewerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-muted-foreground">
        <div className="animate-pulse">Loading content...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-muted-foreground">
        <p>Select a file to view its content</p>
      </div>
    );
  }

  if (viewMode === 'raw') {
    return (
      <div className="relative min-h-full bg-white dark:bg-card">
        <div className="p-8 pb-20 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-white dark:bg-card">
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-8 pb-20">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            a: ({ node, ...props }) => (
              <a {...props} className="text-black dark:text-white underline decoration-gray-400 dark:decoration-gray-600 hover:decoration-black dark:hover:decoration-white transition-all" target="_blank" rel="noopener noreferrer" />
            ),
            img: ({ node, ...props }) => (
              <img {...props} className="rounded-lg border border-gray-200 dark:border-border shadow-sm max-w-full" referrerPolicy="no-referrer" />
            ),
            pre: ({ node, ...props }) => (
              <pre {...props} className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-md p-4 overflow-x-auto" />
            ),
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !className; // Simple heuristic
              return isInline ? (
                <code {...props} className="bg-gray-100 dark:bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                  {children}
                </code>
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 border border-gray-200 dark:border-border rounded-lg">
                <table {...props} className="min-w-full divide-y divide-gray-200 dark:divide-border" />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th {...props} className="px-4 py-3 bg-gray-50 dark:bg-muted text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider" />
            ),
            td: ({ node, ...props }) => (
              <td {...props} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-border" />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
