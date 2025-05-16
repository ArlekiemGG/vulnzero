
import { useState } from 'react';

interface CourseImageProps {
  imageUrl: string;
  title: string;
}

const CourseImage = ({ imageUrl, title }: CourseImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full h-60 md:h-80 bg-gray-100 rounded-lg mb-8 overflow-hidden relative">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-pulse w-16 h-16 rounded-full bg-gray-300" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <span>No se pudo cargar la imagen</span>
        </div>
      )}
      
      <img 
        src={imageUrl}
        alt={title}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true);
          e.currentTarget.src = '/placeholder.svg';
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

export default CourseImage;
