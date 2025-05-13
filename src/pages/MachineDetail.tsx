import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, ArrowLeft, Link as LinkIcon, Database, 
  FileText, Flag, Shield, Download, 
  Clock, Server, HardDrive, Network, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MachineTerminal from '@/components/machines/MachineTerminal';
import MachineProgress, { MachineTask } from '@/components/machines/MachineProgress';
import MachineHints from '@/components/machines/MachineHints';
import { MachineService, MachineDetails } from '@/components/machines/MachineService';
import { MachineSessionService } from '@/components/machines/MachineSessionService';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client'; // Fixed import path
import { TaskHintService } from '@/components/machines/services/TaskHintService'; // Fixed import path

// Define the MachineHint interface
export interface MachineHint {
  id: number;
  title: string;
  content: string;
  level: number;
  pointCost: number;
  locked: boolean;
}

const MachineDetail = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [flagInput, setFlagInput] = useState('');
  const [rootFlagInput, setRootFlagInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [submittingUserFlag, setSubmittingUserFlag] = useState(false);
  const [submittingRootFlag, setSubmittingRootFlag] = useState(false);
  const [userFlagResult, setUserFlagResult] = useState<{ success: boolean; message: string } | null>(null);
  const [rootFlagResult, setRootFlagResult] = useState<{ success: boolean; message: string } | null>(null);
  const [machine, setMachine] = useState<MachineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [machineTasks, setMachineTasks] = useState<MachineTask[]>([]);
  const [userStats, setUserStats] = useState<any>({
    level: 1,
    points: 0,
    pointsToNextLevel: 500,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  const [machineHints, setMachineHints] = useState<MachineHint[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loadingHints, setLoadingHints] = useState<boolean>(true);

  // Fetch machine and user progress data
  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting fetchData with machineId:", machineId);
      
      if (!machineId) {
        console.error("No machine ID provided");
        toast({
          title: "Error",
          description: "No se pudo cargar la máquina: ID no proporcionado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching machine with ID:", machineId);
        
        // Get machine details
        const machineData = MachineService.getMachine(machineId);
        
        if (!machineData) {
          console.error("Machine not found with ID:", machineId);
          toast({
            title: "Error",
            description: "No se pudo encontrar la máquina solicitada.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        console.log("Machine data loaded:", machineData);
        setMachine(machineData);
        
        // Get user progress if user is logged in
        if (user) {
          try {
            const progressData = await MachineService.getUserMachineProgress(user.id, machineId);
            setUserProgress(progressData.progress);
            
            // Since completedTasks doesn't exist in MachineProgress, we need to derive it
            // Let's assume tasks 1-5 are completed if progress is high enough
            const derivedCompletedTasks: number[] = [];
            if (progressData.progress >= 20) derivedCompletedTasks.push(1); // First task
            if (progressData.progress >= 40) derivedCompletedTasks.push(2); // Second task
            if (progressData.progress >= 50) derivedCompletedTasks.push(3); // User flag task
            if (progressData.progress >= 80) derivedCompletedTasks.push(4); // Privilege escalation task
            if (progressData.progress >= 100) derivedCompletedTasks.push(5); // Root flag task
            
            setCompletedTaskIds(derivedCompletedTasks);
            
            // Update the tasks with completed status based on user progress
            if (machineData && machineData.tasks) {
              // Convert machine tasks to MachineTask format for the component
              const updatedTasks = machineData.tasks.map(task => ({
                id: task.id,
                title: task.name, // Map 'name' to 'title' for MachineTask interface
                description: task.description,
                completed: derivedCompletedTasks.includes(task.id)
              }));
              
              setMachineTasks(updatedTasks);
              setMachine(prev => prev ? { ...prev, userProgress: progressData.progress } : null);
            }
          } catch (progressError) {
            console.error("Error loading user progress:", progressError);
            // Continue showing the machine even if progress can't be loaded
          }
        }
      } catch (error) {
        console.error('Error loading machine:', error);
        toast({
          title: "Error",
          description: "Ha ocurrido un error al cargar la información de la máquina.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [machineId, user, toast]);

  // Add this new hook to fetch hints and user points
  useEffect(() => {
    const fetchHintsData = async () => {
      if (!machineId || !user) return;
      
      try {
        setLoadingHints(true);
        
        // Fetch user profile to get current points
        const { data: profileData } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setUserPoints(profileData.points || 0);
        }
        
        // Fetch hints for this machine
        const hints = await TaskHintService.getHints(user.id, machineId);
        setMachineHints(hints);
      } catch (error) {
        console.error('Error loading hints:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las pistas para esta máquina.",
          variant: "destructive"
        });
      } finally {
        setLoadingHints(false);
      }
    };
    
    fetchHintsData();
  }, [machineId, user, toast]);

  const handleConnectToggle = () => {
    if (isConnected) {
      setTerminalOutput(prev => [...prev, "INFO: Desconectando de la máquina..."]);
      setTimeout(() => {
        setIsConnected(false);
        setTerminalOutput([]);
      }, 1000);
    } else {
      // Fix for the VPN connection issue
      setTerminalOutput(["INFO: Conectando a " + (machine?.name || "la máquina") + " (" + (machine?.ipAddress || "unknown") + ")..."]);
      setTimeout(() => {
        setIsConnected(true);
        setTerminalOutput(prev => [
          ...prev, 
          "INFO: Conexión establecida con " + (machine?.name || "la máquina"),
          "$ whoami",
          "cyberhacker",
          "$ hostname",
          "vulnzero-vpn",
          "$ ip addr",
          "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000",
          "    inet 127.0.0.1/8 scope host lo",
          "2: tun0: <POINTOPOINT,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 100",
          "    inet " + (machine?.ipAddress || "10.10.14.8") + "/23 scope global tun0",
        ]);
      }, 1500);
    }
  };

  const handleCommandSubmit = (command: string) => {
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Get the base command and arguments
    const [baseCommand, ...args] = command.split(' ');
    
    // Simulación básica de comandos
    setTimeout(() => {
      switch (baseCommand.toLowerCase()) {
        case 'help':
          setTerminalOutput(prev => [...prev, 
            "Comandos disponibles:",
            "  help                - Muestra esta ayuda",
            "  ping [host]         - Comprueba conectividad con un host",
            "  nmap [host]         - Escanea puertos en un host",
            "  gobuster [options]  - Busca directorios y archivos",
            "  ssh [user@host]     - Intenta conectarse por SSH",
            "  clear               - Limpia la terminal",
            "  getshell/shell      - Intenta obtener una shell en la máquina"
          ]);
          break;
        case 'ping':
          const target = args[0] || machine?.ipAddress || "10.10.10.10";
          setTerminalOutput(prev => [...prev, 
            `PING ${target} (${target}) 56(84) bytes of data.`,
            `64 bytes from ${target}: icmp_seq=1 ttl=63 time=42.8 ms`,
            `64 bytes from ${target}: icmp_seq=2 ttl=63 time=44.1 ms`,
            `64 bytes from ${target}: icmp_seq=3 ttl=63 time=43.5 ms`,
            `64 bytes from ${target}: icmp_seq=4 ttl=63 time=42.9 ms`,
            `--- ${target} ping statistics ---`,
            "4 packets transmitted, 4 received, 0% packet loss, time 3004ms",
            "rtt min/avg/max/mdev = 42.815/43.337/44.129/0.518 ms"
          ]);
          break;
        case 'nmap':
          const scanTarget = args[0] || machine?.ipAddress || "10.10.10.10";
          setTerminalOutput(prev => [...prev, 
            "Starting Nmap 7.92 ( https://nmap.org ) at 2025-05-13 13:37 UTC",
            `Nmap scan report for ${scanTarget}`,
            "Host is up (0.045s latency).",
            "Not shown: 998 closed tcp ports (reset)",
            "PORT   STATE SERVICE",
            "22/tcp open  ssh",
            "80/tcp open  http",
            "Nmap done: 1 IP address (1 host up) scanned in 2.05 seconds"
          ]);
          
          // Marcar la primera tarea como completada (enumeración de servicios)
          if (user && machine && !completedTaskIds.includes(1)) {
            // Actualizar el estado local
            const newCompletedTasks = [...completedTaskIds, 1];
            setCompletedTaskIds(newCompletedTasks);
            
            // Actualizar las tareas en la máquina
            const updatedTasks = machineTasks.map(task => ({
              ...task,
              completed: task.id === 1 ? true : task.completed
            }));
            setMachineTasks(updatedTasks);
            
            // Actualizar el progreso
            const newProgress = Math.max(userProgress, 20);
            setUserProgress(newProgress);
            
            // En una implementación real, esto actualizaría la base de datos
            MachineService.completeTask(user.id, machine.id, 1);
            
            // Mostrar notificación
            toast({
              title: "¡Progreso actualizado!",
              description: "Has completado la tarea: Enumerar servicios",
              variant: "success"
            });
          }
          break;
        case 'gobuster':
          const gobusterTarget = args.find(arg => arg.includes("http")) || `http://${machine?.ipAddress || "10.10.10.10"}/`;
          setTerminalOutput(prev => [...prev, 
            "Gobuster v3.1.0",
            "by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)",
            "=====================================================",
            `Scanning: ${gobusterTarget}`,
            "=====================================================",
            `/img                  (Status: 301) [Size: 310] [-->${gobusterTarget}img/]`,
            `/js                   (Status: 301) [Size: 309] [-->${gobusterTarget}js/]`,
            `/css                  (Status: 301) [Size: 310] [-->${gobusterTarget}css/]`,
            `/admin                (Status: 301) [Size: 312] [-->${gobusterTarget}admin/]`,
            "/login                (Status: 200) [Size: 1248]",
            "/index.php            (Status: 200) [Size: 3678]",
            "/robots.txt           (Status: 200) [Size: 85]",
            "=====================================================",
            "Finished"
          ]);
          break;
        case 'ssh':
          const sshTarget = args[0] || `hacker@${machine?.ipAddress || "10.10.10.10"}`;
          setTerminalOutput(prev => [...prev, 
            `ssh: connect to host ${sshTarget.split('@')[1] || machine?.ipAddress || "10.10.10.10"} port 22: Connection refused`,
            "ERROR: Necesitas encontrar credenciales válidas primero"
          ]);
          break;
        case 'clear':
          setTerminalOutput([]);
          break;
        case 'getshell':
        case 'shell':
          setTerminalOutput(prev => [...prev, 
            "Connecting to remote host...",
            "Spawning shell...",
            "Connection established!",
            "cyberhacker@vulnnet:~$ "
          ]);
          
          // Marcar la segunda tarea como completada (conseguir shell)
          if (user && machine && !completedTaskIds.includes(2)) {
            // Actualizar el estado local
            const newCompletedTasks = [...completedTaskIds, 2];
            setCompletedTaskIds(newCompletedTasks);
            
            // Actualizar las tareas en la máquina
            const updatedTasks = machineTasks.map(task => ({
              ...task,
              completed: task.id === 2 ? true : task.completed
            }));
            setMachineTasks(updatedTasks);
            
            // Actualizar el progreso
            const newProgress = Math.max(userProgress, 40);
            setUserProgress(newProgress);
            
            // En una implementación real, esto actualizaría la base de datos
            MachineService.completeTask(user.id, machine.id, 2);
            
            // Mostrar notificación
            toast({
              title: "¡Progreso actualizado!",
              description: "Has completado la tarea: Conseguir shell",
              variant: "success"
            });
          }
          break;
        default:
          setTerminalOutput(prev => [...prev, `ERROR: Comando '${command}' no reconocido. Escribe 'help' para ver los comandos disponibles.`]);
          break;
      }
    }, 500);
  };

  const handleUserFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flagInput.trim() || !user || !machine?.id) return;
    
    setSubmittingUserFlag(true);
    setUserFlagResult(null);
    
    try {
      const result = await MachineService.submitFlag(user.id, machine.id, flagInput, 'user');
      
      setUserFlagResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        setFlagInput('');
        toast({
          title: "¡Flag capturada!",
          description: `Has obtenido ${result.points || 0} puntos.`,
          variant: "success"
        });
        
        // Actualizar tareas completadas
        const newCompletedTasks = [...completedTaskIds, 3]; // Tarea 3 = flag de usuario
        setCompletedTaskIds(newCompletedTasks);
        
        // Actualizar las tareas en la máquina
        const updatedTasks = machineTasks.map(task => ({
          ...task,
          completed: task.id === 3 ? true : task.completed
        }));
        setMachineTasks(updatedTasks);
        
        // Update user progress
        const newProgress = 50; // Flag de usuario = 50% de progreso
        setUserProgress(newProgress);
        
        // Log the activity
        if (user) {
          await MachineService.logMachineActivity(
            user.id,
            machine.id,
            'flag_captured',
            result.points || 0
          );
        }
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setUserFlagResult({
        success: false,
        message: "Error al procesar la flag. Inténtalo más tarde."
      });
    } finally {
      setSubmittingUserFlag(false);
    }
  };

  const handleRootFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rootFlagInput.trim() || !user || !machine?.id) return;
    
    setSubmittingRootFlag(true);
    setRootFlagResult(null);
    
    try {
      const result = await MachineService.submitFlag(user.id, machine.id, rootFlagInput, 'root');
      
      setRootFlagResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        setRootFlagInput('');
        toast({
          title: "¡Flag de root capturada!",
          description: `¡Felicidades! Has comprometido completamente la máquina y obtenido ${result.points || 0} puntos.`,
          variant: "success"
        });
        
        // Actualizar tareas completadas
        const newCompletedTasks = [...completedTaskIds, 4, 5]; // Tareas 4 y 5 = escalada de privilegios y flag de root
        setCompletedTaskIds(newCompletedTasks);
        
        // Actualizar las tareas en la máquina
        const updatedTasks = machineTasks.map(task => ({
          ...task,
          completed: task.id === 4 || task.id === 5 ? true : task.completed
        }));
        setMachineTasks(updatedTasks);
        
        // Update user progress to 100%
        setUserProgress(100);
        
        // Log the activity
        if (user) {
          await MachineService.logMachineActivity(
            user.id,
            machine.id,
            'machine_completed',
            result.points || 0
          );
        }
      }
    } catch (error) {
      console.error('Error submitting root flag:', error);
      setRootFlagResult({
        success: false,
        message: "Error al procesar la flag de root. Inténtalo más tarde."
      });
    } finally {
      setSubmittingRootFlag(false);
    }
  };

  const handleUnlockHint = async (hintId: number, pointCost: number): Promise<boolean> => {
    if (!user || !machineId) return false;
    
    try {
      // Find the hint by ID
      const hint = machineHints.find(h => h.id === hintId);
      
      if (!hint) {
        toast({
          title: "Error",
          description: "Pista no encontrada.",
          variant: "destructive"
        });
        return false;
      }
      
      const result = await TaskHintService.unlockHint(user.id, machineId, hint.level, pointCost);
      
      if (result.success) {
        // Update the hints state to show the hint as unlocked
        setMachineHints(prevHints => 
          prevHints.map(h => 
            h.id === hintId ? { ...h, locked: false } : h
          )
        );
        
        // Update user points
        setUserPoints(prev => prev - pointCost);
        
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo desbloquear la pista.",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error unlocking hint:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al desbloquear la pista.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Implement the "Start Machine" button functionality
  const handleStartMachine = async () => {
    if (!machineId || !user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para iniciar una máquina",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Show a loading toast
      toast({
        title: "Solicitando máquina",
        description: "Estamos preparando tu máquina...",
      });
      
      console.log("Requesting machine with ID:", machineId);
      
      // Call the MachineSessionService to request a new machine
      const session = await MachineSessionService.requestMachine(user.id, machineId);
      
      if (session) {
        // Success! Navigate to the session page
        toast({
          title: "¡Máquina solicitada!",
          description: "Redirigiendo a la página de la sesión...",
          variant: "success"
        });
        
        // Navigate to the session detail page
        navigate(`/machines/${machineId}/session`);
      } else {
        throw new Error("No se pudo solicitar la máquina");
      }
    } catch (error) {
      console.error("Error starting machine:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la máquina. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cybersec-black">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar userStats={userStats} />
          <div className="flex-1 md:ml-64 p-4 md:p-6">
            <div className="max-w-7xl mx-auto animate-pulse">
              <div className="h-8 w-48 bg-cybersec-darkgray rounded mb-6"></div>
              <div className="h-64 bg-cybersec-darkgray rounded mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-96 bg-cybersec-darkgray rounded"></div>
                  <div className="h-64 bg-cybersec-darkgray rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-cybersec-darkgray rounded"></div>
                  <div className="h-64 bg-cybersec-darkgray rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-cybersec-black">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar userStats={userStats} />
          <div className="flex-1 md:ml-64 p-4 md:p-6">
            <div className="max-w-3xl mx-auto text-center pt-10">
              <h1 className="text-2xl font-bold text-cybersec-red">Máquina no encontrada</h1>
              <p className="mt-4 text-gray-400">La máquina con ID "{machineId}" no existe o ha sido eliminada.</p>
              <Button asChild className="mt-8">
                <Link to="/machines" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado de máquinas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Navegación */}
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/machines" className="flex items-center text-cybersec-electricblue">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a máquinas
                </Link>
              </Button>
            </div>
            
            {/* Header de la máquina */}
            <div className="mb-6 flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3">
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  <img 
                    src={machine?.image} 
                    alt={machine?.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <div className="flex gap-2 mb-2">
                      <Badge className={
                        machine?.difficulty === 'easy' ? 'bg-green-900 text-green-400' :
                        machine?.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                        machine?.difficulty === 'hard' ? 'bg-red-900 text-red-400' :
                        'bg-purple-900 text-purple-400'
                      }>
                        {machine?.difficulty?.charAt(0).toUpperCase() + machine?.difficulty?.slice(1)}
                      </Badge>
                      <Badge className={
                        machine?.osType === 'linux' ? 'bg-blue-900 text-blue-400' :
                        machine?.osType === 'windows' ? 'bg-cyan-900 text-cyan-400' :
                        'bg-gray-900 text-gray-400'
                      }>
                        {machine?.osType?.charAt(0).toUpperCase() + machine?.osType?.slice(1)}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-white">{machine?.name}</h1>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/3 flex flex-col">
                <Card className="flex-grow bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Información de la máquina</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">IP Address</span>
                        <code className="font-mono text-cybersec-electricblue">{machine?.ipAddress}</code>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Puntos</span>
                        <span className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-cybersec-yellow" />
                          {machine?.points}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Resuelto por</span>
                        <span>{machine?.solvedBy} usuarios</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Creador</span>
                        <span>{machine?.creator}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lanzamiento</span>
                        <span>{machine?.releaseDate ? new Date(machine.releaseDate).toLocaleDateString() : '-'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        {machine?.categories?.map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="bg-transparent border-cybersec-electricblue text-cybersec-electricblue">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button 
                        className={`w-full ${
                          isConnected 
                            ? 'bg-cybersec-red/20 border border-cybersec-red text-cybersec-red hover:bg-cybersec-red hover:text-black'
                            : 'bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-black'
                        }`}
                        onClick={() => setIsConnected(!isConnected)}
                      >
                        {isConnected ? 'Desconectar' : 'Conectar VPN'}
                      </Button>
                      <Button 
                        className="w-full bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
                        onClick={handleStartMachine}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar máquina
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda - Terminal y envío de flags */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="terminal">
                  <TabsList className="bg-cybersec-darkgray w-full">
                    <TabsTrigger value="terminal" className="flex-1 data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                      Terminal
                    </TabsTrigger>
                    <TabsTrigger value="flags" className="flex-1 data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                      Enviar Flags
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="terminal" className="mt-4">
                    <div className="h-[500px]">
                      <MachineTerminal 
                        onCommand={handleCommandSubmit} 
                        output={terminalOutput} 
                        isConnected={isConnected} 
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="flags" className="mt-4">
                    <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Envío de Flags</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm text-gray-300 mb-4">
                              Las flags son archivos de texto que encontrarás dentro de la máquina. Captura las flags para demostrar que has comprometido el sistema.
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-md font-medium text-cybersec-electricblue mb-2 flex items-center">
                                <Flag className="h-4 w-4 mr-2" /> Flag de usuario
                              </h4>
                              <form onSubmit={handleUserFlagSubmit} className="flex gap-4">
                                <Input
                                  type="text"
                                  placeholder="Introduce la flag de usuario (ej: flag{abc123...})"
                                  value={flagInput}
                                  onChange={e => setFlagInput(e.target.value)}
                                  className="flex-grow bg-cybersec-black"
                                  disabled={submittingUserFlag || userProgress >= 50}
                                />
                                <Button 
                                  type="submit"
                                  disabled={!flagInput.trim() || submittingUserFlag || userProgress >= 50}
                                  className="bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
                                >
                                  Enviar
                                </Button>
                              </form>
                              {userFlagResult && (
                                <div className={`mt-2 text-sm ${userFlagResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                  {userFlagResult.message}
                                </div>
                              )}
                              {userProgress >= 50 && !userFlagResult && (
                                <div className="mt-2 text-sm text-green-400">
                                  Ya has capturado la flag de usuario.
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-md font-medium text-cybersec-electricblue mb-2 flex items-center">
                                <Shield className="h-4 w-4 mr-2" /> Flag de root
                              </h4>
                              <form onSubmit={handleRootFlagSubmit} className="flex gap-4">
                                <Input
                                  type="text"
                                  placeholder="Introduce la flag de root (ej: flag{xyz789...})"
                                  value={rootFlagInput}
                                  onChange={e => setRootFlagInput(e.target.value)}
                                  className="flex-grow bg-cybersec-black"
                                  disabled={submittingRootFlag || userProgress < 50 || userProgress >= 100}
                                />
                                <Button 
                                  type="submit"
                                  disabled={!rootFlagInput.trim() || submittingRootFlag || userProgress < 50 || userProgress >= 100}
                                  className="bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
                                >
                                  Enviar
                                </Button>
                              </form>
                              {rootFlagResult && (
                                <div className={`mt-2 text-sm ${rootFlagResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                  {rootFlagResult.message}
                                </div>
                              )}
                              {userProgress < 50 && (
                                <div className="mt-2 text-sm text-gray-400">
                                  Debes capturar primero la flag de usuario para desbloquear esta opción.
                                </div>
                              )}
                              {userProgress >= 100 && !rootFlagResult && (
                                <div className="mt-2 text-sm text-green-400">
                                  ¡Felicidades! Has completado esta máquina.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Sobre esta máquina</h3>
                    <p className="text-gray-300 mb-6">{machine.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-cybersec-electricblue mb-2">Requisitos</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {machine.requirements?.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-cybersec-electricblue mb-2">Habilidades</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {machine.skills?.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Columna derecha - Progreso, pistas y recursos */}
              <div className="space-y-6">
                <MachineProgress 
                  tasks={machineTasks} 
                  isLoading={loading} 
                />
                
                <MachineHints 
                  hints={machineHints}
                  onUnlockHint={handleUnlockHint}
                  isLoading={loadingHints}
                  userPoints={userPoints}
                />
                
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Recursos</h3>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                        <a href="#" className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" /> Guía general de pentesting
                        </a>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                        <a href="#" className="flex items-center">
                          <Database className="h-4 w-4 mr-2" /> Cheatsheet de comandos
                        </a>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                        <a href="#" className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2" /> Foro de discusión
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MachineDetail;
