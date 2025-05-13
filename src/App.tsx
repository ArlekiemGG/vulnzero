
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import Tutorials from "./pages/Tutorials";
import Security from "./pages/Security";
import Labs from "./pages/Labs";
import CTFs from "./pages/CTFs";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

// Configure the QueryClient with global settings to prevent infinite loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed queries once
      retryDelay: 2000, // Wait 2 seconds before retrying
      staleTime: 60000, // Data stays fresh for 1 minute
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch when reconnecting
    },
  },
});

// Global loading state tracker
function useGlobalLoadingState() {
  const [loadingStates, setLoadingStates] = useState(new Map());
  
  // Add to loading state
  const startLoading = (key) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.set(key, true);
      return newMap;
    });
  };
  
  // Remove from loading state
  const finishLoading = (key) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };
  
  return {
    isLoading: loadingStates.size > 0,
    startLoading,
    finishLoading
  };
}

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Mark initialization as complete after the first render
    if (!isInitialized) {
      setTimeout(() => setIsInitialized(true), 100);
    }
  }, [isInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
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
              <Route path="/machines/:id" element={
                <ProtectedRoute>
                  <MachineDetail />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/challenges" element={
                <ProtectedRoute>
                  <Challenges />
                </ProtectedRoute>
              } />
              <Route path="/tutorials" element={
                <ProtectedRoute>
                  <Tutorials />
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              } />
              <Route path="/labs" element={
                <ProtectedRoute>
                  <Labs />
                </ProtectedRoute>
              } />
              <Route path="/ctfs" element={
                <ProtectedRoute>
                  <CTFs />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
