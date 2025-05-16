
import { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseImageProps {
  imageUrl: string;
  title: string;
}

const CourseImage = ({ imageUrl, title }: CourseImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [actualUrl, setActualUrl] = useState<string>(imageUrl);

  const placeholderUrl = '/placeholder.svg';

  // Reset states when imageUrl changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setActualUrl(imageUrl);
  }, [imageUrl]);

  // Try different image paths if initial URL fails
  const handleImageError = () => {
    console.error(`Failed to load image: ${actualUrl} for course: ${title}`);
    
    if (actualUrl === imageUrl && imageUrl.includes('/cover.jpg')) {
      // If this is the first attempt and URL ends with cover.jpg, try the placeholder
      setActualUrl(placeholderUrl);
    } else {
      // Mark as error and use placeholder
      setHasError(true);
      setActualUrl(placeholderUrl);
    }
    
    // Mark as loaded so we display something rather than showing the loading state forever
    setIsLoaded(true);
  };

  return (
    <div className="w-full mb-8 overflow-hidden rounded-lg bg-cybersec-darkgray">
      <AspectRatio ratio={16/9} className="bg-gray-900">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-cybersec-darkgray">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cybersec-darkgray text-gray-400 p-4 text-center">
            <span className="text-lg font-medium mb-2">{title || 'Curso'}</span>
            <span className="text-sm">No se pudo cargar la imagen</span>
          </div>
        )}
        
        <img 
          src={actualUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      </AspectRatio>
    </div>
  );
};

export default CourseImage;
