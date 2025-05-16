
import { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CourseImageProps {
  imageUrl: string;
  title: string;
}

const CourseImage = ({ imageUrl, title }: CourseImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const placeholderUrl = '/placeholder.svg';

  return (
    <div className="w-full mb-8 overflow-hidden rounded-lg bg-cybersec-darkgray">
      <AspectRatio ratio={16/9} className="bg-gray-900">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-cybersec-darkgray">
            <div className="animate-pulse w-16 h-16 rounded-full bg-gray-700" />
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-cybersec-darkgray text-gray-400">
            <span>{title || 'No se pudo cargar la imagen'}</span>
          </div>
        )}
        
        <img 
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.error(`Failed to load image: ${imageUrl}`);
            setHasError(true);
            e.currentTarget.src = placeholderUrl;
            setIsLoaded(true);
          }}
        />
      </AspectRatio>
    </div>
  );
};

export default CourseImage;
