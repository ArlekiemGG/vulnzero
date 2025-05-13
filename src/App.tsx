
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
import Labs from './pages/Labs';
import Tutorials from './pages/Tutorials';
import Leaderboard from './pages/Leaderboard';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Security from './pages/Security';

import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
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
              
              <Route path="/labs" element={
                <ProtectedRoute>
                  <Labs />
                </ProtectedRoute>
              } />
              
              <Route path="/tutorials" element={
                <ProtectedRoute>
                  <Tutorials />
                </ProtectedRoute>
              } />
              
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              <Route path="/security" element={<Security />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
