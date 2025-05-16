
import { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseImageProps {
  src: string;
  alt: string;
}

const CourseImage = ({ src, alt }: CourseImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [actualUrl, setActualUrl] = useState<string>(src);

  const placeholderUrl = '/placeholder.svg';

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setActualUrl(src);
  }, [src]);

  // Try different image paths if initial URL fails
  const handleImageError = () => {
    console.error(`Failed to load image: ${actualUrl} for course: ${alt}`);
    
    if (actualUrl === src && !actualUrl.includes('placeholder.svg')) {
      // Si es la primera vez que falla, intentamos con el placeholder
      console.log(`Trying placeholder for ${alt}`);
      setActualUrl(placeholderUrl);
    } else {
      // Marca como error y usa placeholder
      setHasError(true);
      setActualUrl(placeholderUrl);
    }
    
    // Marca como cargado para mostrar algo en vez de un estado de carga infinito
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
            <span className="text-lg font-medium mb-2">{alt || 'Curso'}</span>
            <span className="text-sm">No se pudo cargar la imagen</span>
          </div>
        )}
        
        <img 
          src={actualUrl}
          alt={alt}
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
