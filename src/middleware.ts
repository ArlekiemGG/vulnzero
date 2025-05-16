
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// This is a React component that acts as middleware
// It will be used to handle redirections for course routes
export const RouteMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the current URL matches the old format (for backward compatibility)
    // Two patterns: 
    // 1. /course/courseId/moduleId/lessonId (old format)
    // 2. /courses/courseId/moduleId/lessonId (without 'learn' segment)
    
    const oldFormatRegex = /^\/course\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
    const oldCoursesFormatRegex = /^\/courses\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
    
    let match = location.pathname.match(oldFormatRegex);
    let matchType = 'old';
    
    if (!match) {
      match = location.pathname.match(oldCoursesFormatRegex);
      matchType = 'semi-old';
    }

    if (match) {
      // Extract courseId, moduleId and lessonId from the old URL format
      const [, courseId, moduleId, lessonId] = match;
      
      // Redirect to the new URL format
      const newUrl = `/courses/${courseId}/learn/${moduleId}/${lessonId}`;
      console.log(`Redirecting from ${matchType} URL format to: ${newUrl}`);
      
      navigate(newUrl, { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // This component doesn't render anything, it just performs redirections
  return null;
};

// Export a function that handles the middleware functionality for server-side environments
// This is currently not used since we're in a client-side only app, but could be useful if we move to SSR
export async function middleware(request) {
  const url = new URL(request.url);
  
  // Check if the current URL matches the old format
  const oldFormatRegex = /^\/course\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
  const oldCoursesFormatRegex = /^\/courses\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
  
  let match = url.pathname.match(oldFormatRegex);
  
  if (!match) {
    match = url.pathname.match(oldCoursesFormatRegex);
  }

  if (match) {
    // Extract courseId, moduleId and lessonId from the old URL format
    const [, courseId, moduleId, lessonId] = match;
    
    // Redirect to the new URL format
    return Response.redirect(
      new URL(`/courses/${courseId}/learn/${moduleId}/${lessonId}`, request.url)
    );
  }
  
  return null;
}

export const config = {
  matcher: ['/course/:path*', '/courses/:courseId/:moduleId/:lessonId']
};
