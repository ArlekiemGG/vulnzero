
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Server, Terminal, ExternalLink, Power, Info, Copy, Loader2 } from 'lucide-react';
import { MachineSession, MachineSessionService } from './MachineSessionService';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MachineTerminal from './MachineTerminal';

interface MachineSessionPanelProps {
  machineSession: MachineSession;
  onTerminate: () => void;
  onRefresh: () => void;
}

export const MachineSessionPanel: React.FC<MachineSessionPanelProps> = ({
  machineSession,
  onTerminate,
  onRefresh
}) => {
  const { toast } = useToast();
  const [remainingTime, setRemainingTime] = useState<number>(
    machineSession.remainingTimeMinutes || 0
  );
  const [isTerminating, setIsTerminating] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(
    machineSession.status === 'requested' || machineSession.status === 'provisioning'
  );
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'INFO: Terminal web conectada. Escribe "help" para ver comandos disponibles.',
    'INFO: Para conectarte a SSH, usa el comando "ssh".'
  ]);
  const [terminalConnected, setTerminalConnected] = useState(false);
  
  // Calculate total time from session data
  const totalTime = machineSession.connectionInfo?.maxTimeMinutes || 120; // Default 2 hours
  const timeProgress = Math.max(0, Math.min(100, ((totalTime - remainingTime) / totalTime) * 100));
  
  // Setup countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1/60; // Decrease by 1 second converted to minutes
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Update provisioning state if status changes
  useEffect(() => {
    setIsProvisioning(
      machineSession.status === 'requested' || machineSession.status === 'provisioning'
    );
    
    if (machineSession.status === 'running') {
      setTerminalConnected(true);
    } else {
      setTerminalConnected(false);
    }
  }, [machineSession.status]);

  // Calculate remaining time in hours and minutes
  const hours = Math.floor(remainingTime / 60);
  const minutes = Math.floor(remainingTime % 60);
  const seconds = Math.floor((remainingTime * 60) % 60);
  
  // Format time
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Handle terminate machine
  const handleTerminate = async () => {
    setIsTerminating(true);
    
    try {
      const success = await MachineSessionService.terminateMachine(machineSession.sessionId);
      
      if (success) {
        toast({
          title: "Máquina terminada",
          description: "La máquina ha sido liberada correctamente.",
          variant: "success",
        });
        onTerminate();
      } else {
        throw new Error("Error al terminar la máquina");
      }
    } catch (error) {
      console.error('Error terminating machine:', error);
      toast({
        title: "Error",
        description: "No se pudo terminar la máquina. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsTerminating(false);
    }
  };
  
  // Handle copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-600">Activa</Badge>;
      case 'provisioning':
        return <Badge className="bg-yellow-600">Aprovisionando</Badge>;
      case 'requested':
        return <Badge className="bg-blue-600">Solicitada</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">Error</Badge>;
      case 'terminated':
        return <Badge className="bg-gray-600">Terminada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle terminal commands
  const handleCommand = (command: string) => {
    // Log the command with a prefix
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Process commands
    if (command.toLowerCase() === 'help') {
      setTerminalOutput(prev => [
        ...prev, 
        'Comandos disponibles:',
        '  help - Muestra esta ayuda',
        '  clear - Limpia la terminal',
        '  ssh - Inicia conexión SSH a la máquina',
        '  ping - Hace ping a la máquina',
        '  nmap - Escaneo básico de puertos',
        '  getshell - Intenta obtener una shell en la máquina',
        '  exit - Cierra la sesión SSH actual'
      ]);
    } else if (command.toLowerCase() === 'clear') {
      setTerminalOutput([]);
    } else if (command.toLowerCase() === 'ssh') {
      // Simulate SSH connection
      setTerminalOutput(prev => [
        ...prev,
        'Conectando a ' + machineSession.ipAddress + '...',
        'Autenticando con usuario: ' + machineSession.username,
        'SUCCESS: Conexión establecida',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'ping') {
      // Simulate ping
      setTerminalOutput(prev => [
        ...prev,
        'PING ' + machineSession.ipAddress + ' 56(84) bytes of data.',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=1 ttl=64 time=0.045 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=2 ttl=64 time=0.038 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=3 ttl=64 time=0.041 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=4 ttl=64 time=0.039 ms',
        '--- ' + machineSession.ipAddress + ' ping statistics ---',
        '4 packets transmitted, 4 received, 0% packet loss, time 3055ms',
        'rtt min/avg/max/mdev = 0.038/0.040/0.045/0.005 ms'
      ]);
    } else if (command.toLowerCase() === 'nmap') {
      // Simulate nmap scan
      setTerminalOutput(prev => [
        ...prev,
        'Iniciando escaneo Nmap 7.91 en ' + machineSession.ipAddress,
        'Scanning ' + machineSession.ipAddress + ' [1000 ports]',
        'Discovered open port 22/tcp on ' + machineSession.ipAddress,
        'Discovered open port 80/tcp on ' + machineSession.ipAddress,
        'Completed Nmap scan at ' + new Date().toLocaleTimeString(),
        'Nmap scan report for ' + machineSession.ipAddress,
        'Host is up (0.00045s latency).',
        'PORT   STATE SERVICE',
        '22/tcp open  ssh',
        '80/tcp open  http'
      ]);
    } else if (command.toLowerCase() === 'exit') {
      setTerminalOutput(prev => [
        ...prev,
        'Cerrando sesión...',
        'Conexión terminada.',
        'INFO: Terminal web conectada. Escribe "help" para ver comandos disponibles.'
      ]);
    } else if (command.toLowerCase() === 'getshell') {
      setTerminalOutput(prev => [
        ...prev,
        'Intentando explotar vulnerabilidades conocidas...',
        'Probando rutas web comunes...',
        'Encontrado punto de entrada potencial...',
        'Inyectando payload...',
        'SUCCESS: ¡Shell obtenida!',
        'user@' + machineSession.ipAddress + ':~$ '
      ]);
    } else {
      // Simulate command execution with a generic response
      setTerminalOutput(prev => [
        ...prev,
        'Ejecutando: ' + command,
        'Comando simulado en entorno de práctica.',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    }
  };

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-cybersec-neongreen">
              Sesión Activa
            </CardTitle>
            <CardDescription>
              {machineSession.machineDetails?.name || 'Máquina Vulnerable'}
            </CardDescription>
          </div>
          <div>
            {getStatusBadge(machineSession.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tiempo restante */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cybersec-neongreen" />
              <span>Tiempo restante</span>
            </div>
            <span className="text-cybersec-neongreen font-mono">
              {formattedTime}
            </span>
          </div>
          <Progress value={timeProgress} className="h-1.5" />
        </div>
        
        {/* Provisioning state information */}
        {isProvisioning && (
          <div className="p-4 bg-yellow-900/20 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
              <h4 className="font-medium text-yellow-500">
                Aprovisionando máquina
              </h4>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">
              La máquina está siendo creada y configurada. Este proceso puede tardar hasta 2 minutos.
            </p>
            
            <div className="w-full bg-cybersec-black h-2 rounded overflow-hidden">
              <div className="h-full bg-yellow-500/70 animate-pulse"></div>
            </div>
          </div>
        )}
        
        {/* Tabs para conexión e información */}
        <Tabs defaultValue="terminal" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="terminal" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Terminal Web
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Información
            </TabsTrigger>
          </TabsList>
          
          {/* Terminal Tab */}
          <TabsContent value="terminal" className="mt-0">
            <div className="h-80">
              <MachineTerminal 
                onCommand={handleCommand}
                output={terminalOutput}
                isConnected={machineSession.status === 'running'}
                loading={isProvisioning}
              />
            </div>
          </TabsContent>
          
          {/* Info Tab */}
          <TabsContent value="info" className="mt-0">
            <div className="p-4 bg-cybersec-black rounded-md">
              <h4 className="text-cybersec-electricblue mb-2 flex items-center gap-2">
                <Server className="h-4 w-4" /> Información de conexión
              </h4>
              
              <div className="space-y-3 text-sm">
                {/* IP Address with loading state */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">IP Address:</span>
                  <div className="flex items-center gap-1">
                    {isProvisioning ? (
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-24" />
                        <span className="ml-2 text-xs text-yellow-500">(Pendiente)</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono">{machineSession.ipAddress || 'No disponible'}</span>
                        {machineSession.ipAddress && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(machineSession.ipAddress || '', 'IP')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Username with loading state */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Usuario:</span>
                  <div className="flex items-center gap-1">
                    {isProvisioning ? (
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-24" />
                        <span className="ml-2 text-xs text-yellow-500">(Pendiente)</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono">{machineSession.username || 'No disponible'}</span>
                        {machineSession.username && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(machineSession.username || '', 'Usuario')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Password with loading state */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Contraseña:</span>
                  <div className="flex items-center gap-1">
                    {isProvisioning ? (
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-24" />
                        <span className="ml-2 text-xs text-yellow-500">(Pendiente)</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono">{machineSession.password || 'No disponible'}</span>
                        {machineSession.password && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(machineSession.password || '', 'Contraseña')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* SSH Command with loading state */}
                {!isProvisioning && machineSession.status === 'running' && machineSession.connectionInfo?.sshCommand && (
                  <div className="mt-3 p-2 bg-cybersec-darkgray rounded border border-cybersec-darkgray">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400">Comando SSH:</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => copyToClipboard(machineSession.connectionInfo.sshCommand, 'Comando SSH')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono text-cybersec-electricblue">
                      {machineSession.connectionInfo.sshCommand}
                    </code>
                  </div>
                )}
                
                {/* Mensaje de información en modo de provisioning */}
                {isProvisioning && (
                  <div className="mt-3 p-3 bg-blue-900/20 rounded text-sm text-blue-400 border border-blue-900/40">
                    <p>La información de conexión estará disponible una vez que la máquina haya sido aprovisionada completamente.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-between">
        <Button 
          variant="outline"
          className="border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue hover:text-cybersec-black"
          onClick={onRefresh}
        >
          Actualizar estado
        </Button>
        
        <Button 
          variant="destructive" 
          className="bg-red-800 hover:bg-red-700"
          onClick={handleTerminate}
          disabled={isTerminating}
        >
          <Power className="h-4 w-4 mr-2" />
          {isTerminating ? 'Terminando...' : 'Terminar máquina'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineSessionPanel;
