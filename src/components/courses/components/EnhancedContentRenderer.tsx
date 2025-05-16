
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
      // Process content to better handle code blocks and syntax highlighting
      let enhancedContent = content;
      
      // Replace pre code blocks with syntax highlighted versions
      enhancedContent = enhancedContent.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, 
        (match, language, code) => {
          // Create a placeholder that will be replaced with the actual SyntaxHighlighter component in the render
          return `<div class="syntax-highlight" data-language="${language}" data-code="${encodeURIComponent(code.trim())}"></div>`;
        }
      );
      
      // Process special blocks to enhance colors
      enhancedContent = enhancedContent.replace(
        /<div class="bg-(blue|red|yellow|purple|gray)-900/g,
        '<div class="enhanced-block enhanced-block-$1'
      );

      setProcessedContent(enhancedContent);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  // After the content is rendered to the DOM, find all syntax highlight placeholders and replace with SyntaxHighlighter
  useEffect(() => {
    if (isLoading || !processedContent) return;

    const syntaxElements = document.querySelectorAll('.syntax-highlight');
    syntaxElements.forEach(element => {
      const language = element.getAttribute('data-language') || 'javascript';
      const code = decodeURIComponent(element.getAttribute('data-code') || '');
      
      // Create the SyntaxHighlighter component
      const highlightElement = document.createElement('div');
      highlightElement.className = 'syntax-highlighter-wrapper';
      
      // Render the component manually (in a real app, you'd use ReactDOM.render)
      element.innerHTML = '';
      element.className = 'code-block-container';
      
      // Add language badge
      const langBadge = document.createElement('div');
      langBadge.className = 'code-language-badge';
      langBadge.innerText = language;
      element.appendChild(langBadge);
      
      // Add the highlighted code
      const codeContainer = document.createElement('pre');
      codeContainer.className = `language-${language} rounded-lg overflow-x-auto`;
      codeContainer.style.background = '#1e1e1e';
      codeContainer.style.padding = '1rem';
      codeContainer.style.borderRadius = '0.5rem';
      
      const codeElement = document.createElement('code');
      codeElement.className = `language-${language}`;
      codeElement.textContent = code;
      
      codeContainer.appendChild(codeElement);
      element.appendChild(codeContainer);
    });
    
  }, [isLoading, processedContent]);

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
      className="lesson-content prose max-w-none" 
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default EnhancedContentRenderer;
