
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Server, Clock, FileText, CircleAlert } from 'lucide-react';
import { MachineSessionService } from './MachineSessionService';

interface MachineTypeProps {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  osType: 'windows' | 'linux' | 'other';
  maxTimeMinutes: number;
  onMachineRequested: () => void;
}

export const MachineRequestPanel: React.FC<MachineTypeProps> = ({
  id,
  name,
  description,
  difficulty,
  osType,
  maxTimeMinutes,
  onMachineRequested
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Format time in hours and minutes
  const hours = Math.floor(maxTimeMinutes / 60);
  const minutes = maxTimeMinutes % 60;
  const timeDisplay = hours > 0 
    ? `${hours} hora${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}` 
    : `${minutes} minutos`;
  
  // Get badge color based on difficulty
  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-600">Fácil</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Media</Badge>;
      case 'hard':
        return <Badge className="bg-red-600">Difícil</Badge>;
      case 'insane':
        return <Badge className="bg-purple-600">Insano</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };
  
  // Get OS type badge
  const getOSBadge = () => {
    switch (osType) {
      case 'windows':
        return <Badge className="bg-blue-600">Windows</Badge>;
      case 'linux':
        return <Badge className="bg-orange-600">Linux</Badge>;
      default:
        return <Badge className="bg-gray-600">{osType}</Badge>;
    }
  };
  
  // Handle requesting a new machine
  const handleRequestMachine = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para solicitar una máquina",
        variant: "destructive",
      });
      return;
    }
    
    setIsRequesting(true);
    
    try {
      const session = await MachineSessionService.requestMachine(user.id, id);
      
      if (session) {
        toast({
          title: "Máquina solicitada",
          description: "La máquina está siendo aprovisionada y estará lista en breve.",
          variant: "success",
        });
        onMachineRequested();
      } else {
        throw new Error("No se pudo solicitar la máquina");
      }
    } catch (error) {
      console.error('Error requesting machine:', error);
      toast({
        title: "Error",
        description: "No se pudo solicitar la máquina. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-cybersec-neongreen">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {getDifficultyBadge()}
            {getOSBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de la máquina */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-cybersec-electricblue" />
            <span>Sistema: <span className="text-cybersec-electricblue">{osType === 'windows' ? 'Windows' : osType === 'linux' ? 'Linux' : 'Otro'}</span></span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cybersec-electricblue" />
            <span>Tiempo máximo: <span className="text-cybersec-electricblue">{timeDisplay}</span></span>
          </div>
        </div>
        
        {/* Advertencia */}
        <div className="p-3 bg-cybersec-black rounded-md text-sm">
          <div className="flex gap-2 items-start">
            <CircleAlert className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div>
              <p>Al solicitar esta máquina:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Se creará una instancia nueva y fresca de la máquina</li>
                <li>Tendrá acceso exclusivo durante el tiempo asignado</li>
                <li>La máquina será destruida automáticamente al finalizar</li>
                <li>Asegúrese de guardar sus hallazgos antes de terminar</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
          onClick={handleRequestMachine}
          disabled={isRequesting}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isRequesting ? 'Solicitando...' : 'Iniciar máquina'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineRequestPanel;
