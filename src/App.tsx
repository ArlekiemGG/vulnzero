
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import MachineSessionDetail from './pages/MachineSessionDetail';
import Challenges from './pages/Challenges';
import CTFs from './pages/CTFs';
import Leaderboard from './pages/Leaderboard';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';

import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UserProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/machines" element={
                  <ProtectedRoute>
                    <Machines />
                  </ProtectedRoute>
                } />
                
                <Route path="/machines/:machineId" element={
                  <ProtectedRoute>
                    <MachineDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/machines/:machineId/session" element={
                  <ProtectedRoute>
                    <MachineSessionDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/challenges" element={
                  <ProtectedRoute>
                    <Challenges />
                  </ProtectedRoute>
                } />
                
                <Route path="/ctfs" element={
                  <ProtectedRoute>
                    <CTFs />
                  </ProtectedRoute>
                } />
                
                <Route path="/leaderboard" element={<Leaderboard />} />
                
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </UserProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
