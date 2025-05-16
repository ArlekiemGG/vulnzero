
import { useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonDetail from "./pages/LessonDetail";
import CourseOnboarding from "./pages/CourseOnboarding";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import MachineSessionDetail from "./pages/MachineSessionDetail";
import CTFs from "./pages/CTFs";
import Challenges from "./pages/Challenges";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import Labs from "./pages/Labs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the middleware
import { RouteMiddleware } from "./middleware";

// Import the new course page component
import LessonPage from "./pages/courses/[courseId]/learn/[moduleId]/[lessonId]/page";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Log available routes for debugging
    console.log("App initialized with routes including /courses/:courseId");
  }, []);
  
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouteMiddleware />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/learn/:moduleId/:lessonId" element={<LessonPage />} />
            <Route path="/courses/onboarding" element={<CourseOnboarding />} />
            <Route path="/courses/:courseId/onboarding" element={<CourseOnboarding />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/machines" element={<ProtectedRoute><Machines /></ProtectedRoute>} />
            <Route path="/machines/:machineId" element={<ProtectedRoute><MachineDetail /></ProtectedRoute>} />
            <Route path="/machines/:machineId/session/:sessionId" element={<ProtectedRoute><MachineSessionDetail /></ProtectedRoute>} />
            <Route path="/ctfs" element={<ProtectedRoute><CTFs /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/labs" element={<ProtectedRoute><Labs /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
