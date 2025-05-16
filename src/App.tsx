
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Machines from '@/pages/Machines';
import MachineDetail from '@/pages/MachineDetail';
import Labs from '@/pages/Labs';
import Challenges from '@/pages/Challenges';
import CTFs from '@/pages/CTFs';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonDetail from '@/pages/LessonDetail';
import MachineSessionDetail from '@/pages/MachineSessionDetail';
import NotFound from '@/pages/NotFound';
import Security from '@/pages/Security';
import ProtectedRoute from '@/components/ProtectedRoute';
import Leaderboard from '@/pages/Leaderboard';
import './App.css';
import CourseOnboarding from './pages/CourseOnboarding';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/machines" element={<Machines />} />
          <Route path="/machines/:machineId" element={<MachineDetail />} />
          <Route 
            path="/machines/:machineId/session/:sessionId" 
            element={<ProtectedRoute><MachineSessionDetail /></ProtectedRoute>} 
          />
          
          <Route path="/labs" element={<Labs />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/ctfs" element={<CTFs />} />
          <Route path="/security" element={<Security />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/onboarding" element={<CourseOnboarding />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/learn/:moduleId/:lessonId" element={<LessonDetail />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
