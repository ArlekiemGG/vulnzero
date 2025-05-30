import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MachineSessionPanel from '@/components/machines/MachineSessionPanel';
import MachineRequestPanel from '@/components/machines/MachineRequestPanel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, History, RefreshCw } from 'lucide-react';
import { MachineSessionService } from '@/components/machines/MachineSessionService';
import { MachineService } from '@/components/machines/MachineService';
import MachineProgress from '@/components/machines/MachineProgress';
import { MachineTask } from '@/components/machines/MachineProgress';

const MachineSessionDetail = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userProgress, setUserProgress] = useState<any>({
    progress: 0,
    completedTasks: []
  });
  const [userStats, setUserStats] = useState<any>({
    level: 1,
    points: 0,
    pointsToNextLevel: 500,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [tasks, setTasks] = useState<MachineTask[]>([]);
  
  const fromDashboard = location.state?.fromDashboard === true;
  
  // Fetch machine details and user sessions
  const fetchData = async () => {
    if (!user || !machineId) {
      console.error("Missing user or machineId", { user, machineId });
      return;
    }
    
    try {
      if (!refreshing) setLoading(true);
      
      // Get machine details
      const machineDetails = MachineService.getMachine(machineId);
      if (!machineDetails) {
        console.error("Machine not found:", machineId);
        throw new Error("Máquina no encontrada");
      }
      
      console.log("Machine details loaded:", machineDetails);
      setMachine(machineDetails);
      
      // Transform tasks to match MachineTask interface
      if (machineDetails.tasks) {
        const formattedTasks = machineDetails.tasks.map(task => ({
          id: task.id,
          title: task.name,
          description: task.description,
          completed: false
        }));
        setTasks(formattedTasks);
      }
      
      // Get user active sessions for this machine
      const sessions = await MachineSessionService.getUserActiveSessions(user.id);
      console.log("Active sessions:", sessions);
      
      const machineActiveSessions = sessions.filter(session => session.machineTypeId === machineId);
      console.log("Machine active sessions:", machineActiveSessions);
      setActiveSessions(machineActiveSessions);
      
      // Get user progress for this machine
      const progress = await MachineService.getUserMachineProgress(user.id, machineId);
      console.log("User progress:", progress);
      setUserProgress(progress);
      
      // Check if we need to auto-refresh based on machine status
      const needsRefresh = machineActiveSessions.some(
        session => session.status === 'requested' || session.status === 'provisioning'
      );
      
      if (needsRefresh && !refreshInterval) {
        // Set up auto-refresh every 5 seconds if machine is provisioning
        const interval = window.setInterval(() => {
          fetchData();
        }, 5000);
        setRefreshInterval(interval);
      } else if (!needsRefresh && refreshInterval) {
        // Clear refresh interval when no longer needed
        window.clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      
      // Get session history
      const history = await MachineSessionService.getUserSessionHistory(user.id);
      const machineHistory = history.filter(session => session.machine_type_id === machineId);
      console.log("Session history:", machineHistory);
      setSessionHistory(machineHistory);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la máquina",
        variant: "destructive",
      });
      navigate('/machines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);
  
  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };
  
  // Handle machine terminated
  const handleMachineTerminated = () => {
    fetchData();
  };
  
  // Handle machine requested
  const handleMachineRequested = () => {
    fetchData();
    
    toast({
      title: "Máquina solicitada",
      description: "La máquina está siendo iniciada. Este proceso puede tardar unos segundos.",
      duration: 5000
    });
  };
  
  // Handle task completion
  const handleTaskUpdate = async (taskId: number, completed: boolean) => {
    if (!user || !machineId) return;
    
    try {
      setRefreshing(true);
      
      const success = await MachineService.completeTask(user.id, machineId, taskId, completed);
      
      if (success) {
        toast({
          title: completed ? "Tarea completada" : "Tarea desmarcada",
          description: `La tarea ha sido ${completed ? 'marcada como completada' : 'desmarcada'} correctamente.`,
          duration: 3000
        });
        await fetchData();
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la tarea",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    console.log("MachineSessionDetail mounted with machineId:", machineId);
    console.log("User authenticated:", !!user);
    console.log("From dashboard:", fromDashboard);
    
    // Only fetch if we have a user and machineId
    if (user && machineId) {
      fetchData();
    }
  }, [machineId, user]);
  
  // Generate the correct back button URL based on where we came from
  const getBackButtonUrl = () => {
    return fromDashboard ? '/dashboard' : '/machines';
  };
  
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header y navegación */}
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                className="border-cybersec-electricblue text-cybersec-electricblue"
                onClick={() => navigate(getBackButtonUrl())}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> 
                {fromDashboard ? 'Volver al Dashboard' : 'Volver a Máquinas'}
              </Button>
              
              <Button 
                variant="outline"
                className="border-cybersec-neongreen text-cybersec-neongreen"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
            
            {loading ? (
              // Loading state
              <div className="space-y-4">
                <div className="h-8 bg-cybersec-darkgray animate-pulse rounded-md w-1/3"></div>
                <div className="h-40 bg-cybersec-darkgray animate-pulse rounded-md"></div>
                <div className="h-80 bg-cybersec-darkgray animate-pulse rounded-md"></div>
              </div>
            ) : (
              <>
                {/* Title */}
                <h1 className="text-2xl font-bold text-cybersec-neongreen mb-6">
                  {machine?.name || 'Detalles de la Máquina'}
                </h1>
                
                {/* Machine Session */}
                {activeSessions.length > 0 ? (
                  // Display active session
                  <MachineSessionPanel 
                    machineSession={activeSessions[0]}
                    onTerminate={handleMachineTerminated}
                    onRefresh={handleRefresh}
                  />
                ) : (
                  // Display machine request panel
                  <MachineRequestPanel 
                    id={machine?.id}
                    name={machine?.name}
                    description={machine?.description}
                    difficulty={machine?.difficulty}
                    osType={machine?.osType}
                    maxTimeMinutes={120} // Default value
                    onMachineRequested={handleMachineRequested}
                  />
                )}
                
                {/* Machine Progress */}
                <div className="mt-8">
                  <MachineProgress 
                    tasks={tasks}
                    isLoading={loading || refreshing}
                    completedTasksIds={userProgress?.completedTasks || []}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </div>
                
                {/* Session History */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-cybersec-electricblue mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Historial de sesiones
                  </h2>
                  
                  {sessionHistory.length === 0 ? (
                    <div className="bg-cybersec-darkgray p-6 rounded-md text-center text-gray-400">
                      No hay historial de sesiones para esta máquina
                    </div>
                  ) : (
                    <div className="bg-cybersec-darkgray rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-cybersec-black/50">
                          <tr>
                            <th className="py-3 px-4 text-left text-cybersec-electricblue">Fecha</th>
                            <th className="py-3 px-4 text-left text-cybersec-electricblue">Duración</th>
                            <th className="py-3 px-4 text-left text-cybersec-electricblue">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionHistory.map((session, index) => (
                            <tr key={session.id} className={`${index % 2 === 0 ? 'bg-cybersec-black/20' : ''}`}>
                              <td className="py-3 px-4">
                                {new Date(session.started_at).toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                {session.duration_minutes ? 
                                  `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m` : 
                                  'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  session.status === 'terminated' ? 'bg-green-900/30 text-green-500' : 
                                  session.status === 'failed' ? 'bg-red-900/30 text-red-500' : 
                                  'bg-yellow-900/30 text-yellow-500'
                                }`}>
                                  {session.status === 'terminated' ? 'Completada' : 
                                   session.status === 'failed' ? 'Error' :
                                   'Incompleta'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MachineSessionDetail;
