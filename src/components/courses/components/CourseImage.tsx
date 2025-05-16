
import { useState } from 'react';

interface CourseImageProps {
  imageUrl: string;
  title: string;
}

const CourseImage = ({ imageUrl, title }: CourseImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-60 md:h-80 bg-gray-100 rounded-lg mb-8 overflow-hidden">
      <img 
        src={imageUrl}
        alt={title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="eager"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

export default CourseImage;
