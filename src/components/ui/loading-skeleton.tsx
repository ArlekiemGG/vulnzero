
import React from 'react';
import { Skeleton } from './skeleton';

interface CTFCardSkeletonProps {
  isPast?: boolean;
}

export const CTFCardSkeleton: React.FC<CTFCardSkeletonProps> = ({ isPast = false }) => {
  if (isPast) {
    return (
      <div className="bg-cybersec-darkgray border border-cybersec-darkgray rounded-lg overflow-hidden">
        <Skeleton className="h-36 w-full" />
        <div className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cybersec-darkgray border border-cybersec-darkgray rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="grid grid-cols-2 gap-y-3 mb-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </div>
    </div>
  );
};

export const CTFSessionSkeleton: React.FC = () => {
  return (
    <div className="bg-cybersec-darkgray border border-cybersec-darkgray rounded-lg mb-6">
      <div className="p-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="p-6 pt-0">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="flex-1">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            
            <div className="mt-8">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
