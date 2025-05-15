import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, Server, Terminal, Download, Wifi, AlertTriangle } from 'lucide-react';
import { MachineSession } from './MachineSessionService';
import { calculateRemainingTime } from './utils/SessionUtils';
import MachineTerminal from './MachineTerminal';
import { useToast } from '@/components/ui/use-toast';
import { MachineApi } from './services/session/api';

interface MachineSessionPanelProps {
  machineSession: MachineSession;
  onTerminate: () => void;
  onRefresh?: () => void;
}

const MachineSessionPanel: React.FC<MachineSessionPanelProps> = ({ 
  machineSession,
  onTerminate,
  onRefresh
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isTerminating, setIsTerminating] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Actualizar tiempo restante cada segundo
    const updateTimeLeft = () => {
      if (machineSession.expiresAt) {
        const remainingMinutes = calculateRemainingTime(machineSession.expiresAt);
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [machineSession.expiresAt]);
  
  const handleTerminate = async () => {
    try {
      setIsTerminating(true);
      
      // Llamar a la API para liberar la máquina
      const result = await MachineApi.releaseMachine(machineSession.sessionId);
      
      if (!result.exito) {
        throw new Error(result.mensaje || 'Error al liberar la máquina');
      }
      
      toast({
        title: 'Máquina liberada',
        description: 'La máquina ha sido terminada correctamente.',
        duration: 5000
      });
      
      // Notificar al componente padre
      onTerminate();
    } catch (error) {
      console.error('Error terminating machine:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al liberar la máquina',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsTerminating(false);
    }
  };

  const downloadVpnConfig = async () => {
    try {
      const { success, config } = await MachineApi.downloadVpnConfig(machineSession.id);
      
      if (!success || !config) {
        throw new Error('No se pudo obtener la configuración VPN');
      }
      
      // Crear un blob y descargarlo como archivo
      const blob = new Blob([config], { type: 'application/x-openvpn-profile' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `vulnzero-${machineSession.machineTypeId}.ovpn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Configuración VPN descargada',
        description: 'Usa este archivo con tu cliente OpenVPN para conectarte a la máquina.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error downloading VPN config:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al descargar configuración VPN',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Determinar el estado de la máquina para mostrar el indicador correcto
  const getMachineStatusIndicator = () => {
    switch (machineSession.status) {
      case 'requested':
        return <div className="flex items-center"><Shield className="h-4 w-4 text-yellow-500 mr-1" /> Solicitada</div>;
      case 'provisioning':
        return <div className="flex items-center"><Server className="h-4 w-4 text-yellow-500 mr-1 animate-pulse" /> Iniciando</div>;
      case 'running':
        return <div className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-1" /> Activa</div>;
      case 'terminated':
        return <div className="flex items-center"><Shield className="h-4 w-4 text-gray-500 mr-1" /> Terminada</div>;
      case 'failed':
        return <div className="flex items-center"><AlertTriangle className="h-4 w-4 text-red-500 mr-1" /> Error</div>;
      default:
        return <div className="flex items-center"><Shield className="h-4 w-4 text-gray-500 mr-1" /> Desconocido</div>;
    }
  };

  // Renderizar detalles de conexión según el status
  const renderConnectionDetails = () => {
    if (machineSession.status === 'running') {
      return (
        <div className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-cybersec-darkgray p-4 rounded-md">
              <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">SSH Access</h3>
              <div className="text-sm font-mono bg-cybersec-black p-2 rounded">
                ssh {machineSession.username}@{machineSession.ipAddress} -p {machineSession.connectionInfo?.puertoSSH}
              </div>
              <div className="mt-2 text-sm">
                <p>Username: <span className="font-mono">{machineSession.username}</span></p>
                <p>Password: <span className="font-mono">{machineSession.password}</span></p>
              </div>
            </div>
            
            {machineSession.vpnConfigAvailable && (
              <div className="bg-cybersec-darkgray p-4 rounded-md">
                <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">VPN Access</h3>
                <p className="text-sm">Conéctate directamente desde tu equipo usando OpenVPN.</p>
                <Button 
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-cybersec-electricblue text-cybersec-electricblue"
                  onClick={downloadVpnConfig}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar .ovpn
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full bg-cybersec-darkgray border-cybersec-darkerborder">
      <CardHeader className="pb-4">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-xl text-cybersec-neongreen">
              Máquina en ejecución
            </CardTitle>
            <CardDescription>
              {getMachineStatusIndicator()}
            </CardDescription>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-cybersec-electricblue mr-1" />
            <span className="font-mono">{timeLeft || "Calculando..."}</span>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="terminal" className="w-full">
        <TabsList className="w-full bg-cybersec-black">
          <TabsTrigger value="terminal" className="flex-1">
            <Terminal className="h-4 w-4 mr-2" />
            Terminal Web
          </TabsTrigger>
          <TabsTrigger value="services" className="flex-1">
            <Server className="h-4 w-4 mr-2" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="connection" className="flex-1">
            <Wifi className="h-4 w-4 mr-2" />
            Conexión
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="terminal" className="border-none p-0 pt-4">
          <CardContent className="p-0">
            <div className="min-h-[400px] bg-cybersec-black rounded-md overflow-hidden">
              {onRefresh && (
                <MachineTerminal 
                  sessionId={machineSession.sessionId}
                  onRefresh={onRefresh}
                />
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="services" className="border-none">
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">Servicios detectados</h3>
                {machineSession.services && machineSession.services.length > 0 ? (
                  <div className="bg-cybersec-black p-3 rounded-md overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-cybersec-darkerborder">
                          <th className="text-left py-2 px-3 text-cybersec-electricblue">Servicio</th>
                          <th className="text-left py-2 px-3 text-cybersec-electricblue">Puerto</th>
                          <th className="text-left py-2 px-3 text-cybersec-electricblue">Estado</th>
                          <th className="text-left py-2 px-3 text-cybersec-electricblue">Versión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machineSession.services.map((service, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-cybersec-darkgray/20' : ''}>
                            <td className="py-2 px-3 font-mono">{service.nombre}</td>
                            <td className="py-2 px-3 font-mono">{service.puerto}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                service.estado === 'open' ? 'bg-green-900/30 text-green-500' : 
                                service.estado === 'filtered' ? 'bg-yellow-900/30 text-yellow-500' :
                                'bg-red-900/30 text-red-500'
                              }`}>
                                {service.estado}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-xs">{service.version || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-cybersec-black p-4 rounded-md text-center text-gray-400">
                    No se han detectado servicios aún
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">Vulnerabilidades potenciales</h3>
                {machineSession.vulnerabilities && machineSession.vulnerabilities.length > 0 ? (
                  <div className="space-y-2">
                    {machineSession.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="bg-cybersec-black p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{vuln.nombre}</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            vuln.severidad === 'crítica' ? 'bg-red-900/30 text-red-500' : 
                            vuln.severidad === 'alta' ? 'bg-orange-900/30 text-orange-500' :
                            vuln.severidad === 'media' ? 'bg-yellow-900/30 text-yellow-500' :
                            'bg-blue-900/30 text-blue-500'
                          }`}>
                            {vuln.severidad}
                          </span>
                        </div>
                        {vuln.cve && <div className="text-xs font-mono text-cybersec-electricblue mt-1">{vuln.cve}</div>}
                        {vuln.descripcion && <div className="text-xs mt-1">{vuln.descripcion}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-cybersec-black p-4 rounded-md text-center text-gray-400">
                    No se han detectado vulnerabilidades aún
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="connection" className="border-none">
          <CardContent>
            {renderConnectionDetails()}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t border-cybersec-darkerborder pt-4">
        <div className="text-sm text-gray-400">
          <span>Sesión ID: <span className="font-mono text-xs">{machineSession.sessionId.substring(0, 12)}...</span></span>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleTerminate} 
          disabled={isTerminating || machineSession.status === 'terminated'}
        >
          {isTerminating ? "Terminando..." : "Terminar máquina"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineSessionPanel;
