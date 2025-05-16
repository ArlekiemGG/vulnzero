
import { Skeleton } from '@/components/ui/skeleton';

const LessonDetailSkeleton = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="w-full md:w-1/4">
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default LessonDetailSkeleton;
