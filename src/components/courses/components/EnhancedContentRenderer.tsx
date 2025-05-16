
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import './lesson-content.css';

interface EnhancedContentRendererProps {
  content: string;
}

const EnhancedContentRenderer = ({ content }: EnhancedContentRendererProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processedContent, setProcessedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Process content to enhance styling
  useEffect(() => {
    if (!content) {
      setIsLoading(false);
      setError("No se encontró contenido para esta lección");
      return;
    }

    try {
      // Add a small delay to show loading animation
      const timer = setTimeout(() => {
        // Process content to better handle code blocks and syntax highlighting
        let enhancedContent = content;
        
        // Add code language badges to code blocks
        enhancedContent = enhancedContent.replace(
          /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, 
          (match, language, code) => {
            return `<div class="code-block-container">
                      <div class="code-language-badge">${language}</div>
                      <pre><code class="language-${language}">${code}</code></pre>
                    </div>`;
          }
        );
        
        // Process special blocks to enhance colors
        enhancedContent = enhancedContent.replace(
          /<div class="bg-(blue|red|yellow|purple|gray)-900/g,
          '<div class="enhanced-block enhanced-block-$1'
        );

        // Enhance tables for better visibility
        enhancedContent = enhancedContent.replace(
          /<table>/g,
          '<table class="enhanced-table">'
        );

        // Process hyperlinks to open in new tab
        enhancedContent = enhancedContent.replace(
          /<a href="(http[s]?:\/\/[^"]+)">/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">'
        );

        setProcessedContent(enhancedContent);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error procesando el contenido:", err);
      setError("Error al procesar el contenido de la lección");
      setIsLoading(false);
    }
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

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div 
      className="lesson-content" 
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default EnhancedContentRenderer;
