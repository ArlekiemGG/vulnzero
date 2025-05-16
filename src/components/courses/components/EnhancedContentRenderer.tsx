
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EnhancedContentRendererProps {
  content: string;
}

const EnhancedContentRenderer = ({ content }: EnhancedContentRendererProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processedContent, setProcessedContent] = useState('');

  // Process content to enhance styling
  useEffect(() => {
    if (!content) {
      setIsLoading(false);
      return;
    }

    // Add a small delay to show loading animation
    const timer = setTimeout(() => {
      // Process and inject additional classes for better styling
      let enhancedContent = content;
      
      setProcessedContent(enhancedContent);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-1/2 mt-8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div 
      className="lesson-content prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default EnhancedContentRenderer;
