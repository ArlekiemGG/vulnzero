
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Trophy, ArrowLeft, Link as LinkIcon, Database, 
  FileText, Flag, Shield, Download, Activity, Check 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MachineTerminal from '@/components/machines/MachineTerminal';

// Mock data para máquina
const mockMachine = {
  id: "machine1",
  name: "VulnNet",
  description: "VulnNet es una máquina Linux diseñada para principiantes que quieren aprender sobre vulnerabilidades web comunes, enumeración de servicios y escalada de privilegios en entornos Linux. La máquina contiene múltiples vectores de ataque, permitiendo a los usuarios practicar técnicas de reconocimiento, explotación web y post-explotación.",
  difficulty: "easy" as const,
  categories: ["Web", "Privilege Escalation", "Linux"],
  points: 20,
  solvedBy: 1250,
  userProgress: 45,
  ipAddress: "10.10.10.15",
  creator: "CyberChallenge Team",
  releaseDate: "2023-08-15",
  image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  osType: "linux" as const,
  requirements: ["Conocimientos básicos de Linux", "Familiaridad con herramientas de reconocimiento", "Conceptos de seguridad web"],
  skills: ["Enumeración de servicios", "Explotación de vulnerabilidades web", "Escalada de privilegios"],
  hints: [
    { id: 1, title: "Enumeración inicial", content: "Comienza con un escaneo de puertos completo", locked: false },
    { id: 2, title: "Servicio web", content: "¿Has revisado todos los directorios?", locked: false },
    { id: 3, title: "Usuario inicial", content: "Las credenciales están ocultas en un archivo de configuración", locked: true },
    { id: 4, title: "Escalada de privilegios", content: "Busca tareas programadas inusuales", locked: true },
  ],
  tasks: [
    { id: 1, title: "Enumerar servicios", description: "Identifica todos los servicios ejecutándose en la máquina", completed: true },
    { id: 2, title: "Conseguir shell", description: "Obtén una shell en el sistema", completed: true },
    { id: 3, title: "Obtener flag de usuario", description: "Encuentra la flag en el directorio del usuario", completed: false },
    { id: 4, title: "Escalar privilegios", description: "Escala privilegios a root", completed: false },
    { id: 5, title: "Obtener flag de root", description: "Encuentra la flag de root", completed: false },
  ],
};

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [flagInput, setFlagInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [flagResult, setFlagResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // En una aplicación real, obtendríamos los datos de la máquina con el ID
  const machine = mockMachine;

  const handleConnectToggle = () => {
    if (isConnected) {
      setTerminalOutput(prev => [...prev, "INFO: Desconectando de la máquina..."]);
      setTimeout(() => {
        setIsConnected(false);
        setTerminalOutput([]);
      }, 1000);
    } else {
      setTerminalOutput(["INFO: Conectando a VulnNet (10.10.10.15)..."]);
      setTimeout(() => {
        setIsConnected(true);
        setTerminalOutput(prev => [
          ...prev, 
          "INFO: Conexión establecida con VulnNet",
          "$ whoami",
          "cyberhacker",
          "$ hostname",
          "cyberlabs-vpn",
          "$ ip addr",
          "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000",
          "    inet 127.0.0.1/8 scope host lo",
          "2: tun0: <POINTOPOINT,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 100",
          "    inet 10.10.14.8/23 scope global tun0",
        ]);
      }, 1500);
    }
  };

  const handleCommandSubmit = (command: string) => {
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Simulación básica de comandos
    setTimeout(() => {
      switch (command.toLowerCase()) {
        case 'help':
          setTerminalOutput(prev => [...prev, 
            "Comandos disponibles:",
            "  help       - Muestra esta ayuda",
            "  ping       - Comprueba conectividad con la máquina",
            "  nmap       - Escanea puertos en la máquina",
            "  gobuster   - Busca directorios y archivos",
            "  ssh        - Intenta conectarse por SSH",
            "  clear      - Limpia la terminal"
          ]);
          break;
        case 'ping':
          setTerminalOutput(prev => [...prev, 
            "PING 10.10.10.15 (10.10.10.15) 56(84) bytes of data.",
            "64 bytes from 10.10.10.15: icmp_seq=1 ttl=63 time=42.8 ms",
            "64 bytes from 10.10.10.15: icmp_seq=2 ttl=63 time=44.1 ms",
            "64 bytes from 10.10.10.15: icmp_seq=3 ttl=63 time=43.5 ms",
            "64 bytes from 10.10.10.15: icmp_seq=4 ttl=63 time=42.9 ms",
            "--- 10.10.10.15 ping statistics ---",
            "4 packets transmitted, 4 received, 0% packet loss, time 3004ms",
            "rtt min/avg/max/mdev = 42.815/43.337/44.129/0.518 ms"
          ]);
          break;
        case 'nmap':
          setTerminalOutput(prev => [...prev, 
            "Starting Nmap 7.92 ( https://nmap.org ) at 2023-08-15 13:37 UTC",
            "Nmap scan report for 10.10.10.15",
            "Host is up (0.045s latency).",
            "Not shown: 998 closed tcp ports (reset)",
            "PORT   STATE SERVICE",
            "22/tcp open  ssh",
            "80/tcp open  http",
            "Nmap done: 1 IP address (1 host up) scanned in 2.05 seconds"
          ]);
          break;
        case 'gobuster':
          setTerminalOutput(prev => [...prev, 
            "Gobuster v3.1.0",
            "by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)",
            "=====================================================",
            "Scanning: http://10.10.10.15/",
            "=====================================================",
            "/img                  (Status: 301) [Size: 310] [-->http://10.10.10.15/img/]",
            "/js                   (Status: 301) [Size: 309] [-->http://10.10.10.15/js/]",
            "/css                  (Status: 301) [Size: 310] [-->http://10.10.10.15/css/]",
            "/admin                (Status: 301) [Size: 312] [-->http://10.10.10.15/admin/]",
            "/login                (Status: 200) [Size: 1248]",
            "/index.php            (Status: 200) [Size: 3678]",
            "/robots.txt           (Status: 200) [Size: 85]",
            "=====================================================",
            "Finished"
          ]);
          break;
        case 'ssh':
          setTerminalOutput(prev => [...prev, 
            "ssh: connect to host 10.10.10.15 port 22: Connection refused",
            "ERROR: Necesitas encontrar credenciales válidas primero"
          ]);
          break;
        case 'clear':
          setTerminalOutput([]);
          break;
        default:
          setTerminalOutput(prev => [...prev, `ERROR: Comando '${command}' no reconocido. Escribe 'help' para ver los comandos disponibles.`]);
          break;
      }
    }, 500);
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flagInput.trim()) return;
    
    setSubmittingFlag(true);
    setFlagResult(null);
    
    // Simulamos verificación de flag
    setTimeout(() => {
      const isCorrect = flagInput.includes('flag') || flagInput.includes('FLAG');
      
      setFlagResult({
        success: isCorrect,
        message: isCorrect 
          ? "¡Felicidades! Has capturado la flag correctamente." 
          : "Flag incorrecta. Inténtalo de nuevo."
      });
      
      if (isCorrect) {
        setFlagInput('');
      }
      
      setSubmittingFlag(false);
    }, 1500);
  };

  if (!machine) {
    return (
      <div className="min-h-screen bg-cybersec-black pt-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-cybersec-red">Máquina no encontrada</h1>
          <p className="mt-4 text-gray-400">La máquina con ID "{id}" no existe o ha sido eliminada.</p>
          <Button asChild className="mt-8">
            <Link to="/machines" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado de máquinas
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      
      <main className="pt-20 pb-10 px-4 sm:px-6">
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
                  src={machine.image} 
                  alt={machine.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="flex gap-2 mb-2">
                    <Badge className={
                      machine.difficulty === 'easy' ? 'bg-green-900 text-green-400' :
                      machine.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                      machine.difficulty === 'hard' ? 'bg-red-900 text-red-400' :
                      'bg-purple-900 text-purple-400'
                    }>
                      {machine.difficulty.charAt(0).toUpperCase() + machine.difficulty.slice(1)}
                    </Badge>
                    <Badge className={
                      machine.osType === 'linux' ? 'bg-blue-900 text-blue-400' :
                      machine.osType === 'windows' ? 'bg-cyan-900 text-cyan-400' :
                      'bg-gray-900 text-gray-400'
                    }>
                      {machine.osType.charAt(0).toUpperCase() + machine.osType.slice(1)}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-white">{machine.name}</h1>
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
                      <code className="font-mono text-cybersec-electricblue">{machine.ipAddress}</code>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Puntos</span>
                      <span className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1 text-cybersec-yellow" />
                        {machine.points}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resuelto por</span>
                      <span>{machine.solvedBy} usuarios</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creador</span>
                      <span>{machine.creator}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lanzamiento</span>
                      <span>{new Date(machine.releaseDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tu progreso</span>
                        <span>{machine.userProgress}%</span>
                      </div>
                      <Progress value={machine.userProgress} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {machine.categories.map((cat, idx) => (
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
                      onClick={handleConnectToggle}
                    >
                      {isConnected ? 'Desconectar' : 'Conectar VPN'}
                    </Button>
                    <Button asChild className="w-full bg-cybersec-darkgray border border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue hover:text-black">
                      <Link to="#" className="flex items-center justify-center">
                        <Download className="h-4 w-4 mr-2" />
                        Archivos
                      </Link>
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
                            <form onSubmit={handleFlagSubmit} className="flex gap-4">
                              <Input
                                type="text"
                                placeholder="Introduce la flag de usuario (ej: flag{abc123...})"
                                value={flagInput}
                                onChange={e => setFlagInput(e.target.value)}
                                className="flex-grow bg-cybersec-black"
                                disabled={submittingFlag}
                              />
                              <Button 
                                type="submit"
                                disabled={!flagInput.trim() || submittingFlag}
                                className="bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
                              >
                                Enviar
                              </Button>
                            </form>
                            {flagResult && (
                              <div className={`mt-2 text-sm ${flagResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {flagResult.message}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="text-md font-medium text-cybersec-electricblue mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-2" /> Flag de root
                            </h4>
                            <form className="flex gap-4">
                              <Input
                                type="text"
                                placeholder="Introduce la flag de root (ej: flag{xyz789...})"
                                className="flex-grow bg-cybersec-black"
                                disabled={true}
                              />
                              <Button 
                                type="submit"
                                disabled={true}
                                className="bg-cybersec-darkgray border border-gray-600 text-gray-500"
                              >
                                Enviar
                              </Button>
                            </form>
                            <div className="mt-2 text-sm text-gray-400">
                              Debes enviar primero la flag de usuario para desbloquear esta opción.
                            </div>
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
                        {machine.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-cybersec-electricblue mb-2">Habilidades</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        {machine.skills.map((skill, idx) => (
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
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Progreso</h3>
                  
                  <div className="space-y-4">
                    {machine.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded flex items-start ${
                          task.completed ? 'bg-green-900/20 border border-green-700/50' : 'bg-cybersec-black'
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-full ${task.completed ? 'bg-green-700/50' : 'bg-cybersec-darkgray'} mr-3`}>
                          {task.completed ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Activity className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'text-green-400' : 'text-cybersec-electricblue'}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-400">{task.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-cybersec-neongreen mb-4 flex justify-between items-center">
                    <span>Pistas</span>
                    <Badge className="bg-cybersec-electricblue text-cybersec-black">4 Disponibles</Badge>
                  </h3>
                  
                  <div className="space-y-3">
                    {machine.hints.map((hint) => (
                      <Card key={hint.id} className={`bg-cybersec-black border-cybersec-black`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-cybersec-electricblue">{hint.title}</h4>
                            {hint.locked ? (
                              <Button variant="outline" size="sm" className="h-7 text-xs border-cybersec-yellow text-cybersec-yellow hover:bg-cybersec-yellow/10">
                                Desbloquear (-50 pts)
                              </Button>
                            ) : (
                              <Badge className="bg-green-900/30 text-green-400 border-green-700">Desbloqueado</Badge>
                            )}
                          </div>
                          {hint.locked ? (
                            <p className="text-sm text-gray-500">Esta pista está bloqueada. Desbloquéala para ver su contenido.</p>
                          ) : (
                            <p className="text-sm text-gray-300">{hint.content}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Recursos</h3>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                      <a href="#" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Guía de conexión OpenVPN</span>
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                      <a href="#" className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        <span>Tutoriales de enumeración</span>
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start text-left border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10" asChild>
                      <a href="#" className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        <span>Herramientas recomendadas</span>
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
  );
};

export default MachineDetail;
