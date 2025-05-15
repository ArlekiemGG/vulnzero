
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Server, Terminal, Download, Wifi } from 'lucide-react';
import { MachineSession } from './MachineSessionService';
import { calculateRemainingTime } from './utils/SessionUtils';
import MachineTerminal from './MachineTerminal';
import { useToast } from '@/components/ui/use-toast';
import { MachineApi } from './services/session/api';
import MachineStatusIndicator from './components/MachineStatusIndicator';
import ConnectionDetails from './components/ConnectionDetails';
import ServicesTab from './components/ServicesTab';

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
  const [isDownloadingVpn, setIsDownloadingVpn] = useState(false);
  const { toast } = useToast();
  
  // Update remaining time every second
  useEffect(() => {
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
  
  // Handle machine termination
  const handleTerminate = async () => {
    try {
      setIsTerminating(true);
      
      // Call API to release the machine
      const result = await MachineApi.releaseMachine(machineSession.sessionId);
      
      if (!result.exito) {
        throw new Error(result.mensaje || 'Error al liberar la máquina');
      }
      
      toast({
        title: 'Máquina liberada',
        description: 'La máquina ha sido terminada correctamente.',
        duration: 5000
      });
      
      // Notify parent component
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

  // Handle VPN config download
  const downloadVpnConfig = async () => {
    try {
      setIsDownloadingVpn(true);
      const { success, config } = await MachineApi.downloadVpnConfig(machineSession.id);
      
      if (!success || !config) {
        throw new Error('No se pudo obtener la configuración VPN');
      }
      
      // Create a blob and download it as a file
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
    } finally {
      setIsDownloadingVpn(false);
    }
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
              <MachineStatusIndicator status={machineSession.status} />
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
            <ServicesTab 
              services={machineSession.services} 
              vulnerabilities={machineSession.vulnerabilities} 
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="connection" className="border-none">
          <CardContent>
            <ConnectionDetails 
              machineSession={machineSession}
              isDownloadingVpn={isDownloadingVpn}
              onDownloadVpn={downloadVpnConfig}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t border-cybersec-darkerborder pt-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            <span>Sesión ID: <span className="font-mono text-xs">{machineSession.sessionId.substring(0, 12)}...</span></span>
          </div>
          {machineSession.vpnConfigAvailable && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-cybersec-electricblue text-cybersec-electricblue"
              onClick={downloadVpnConfig}
              disabled={isDownloadingVpn}
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloadingVpn ? "Descargando..." : "VPN Config"}
            </Button>
          )}
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
