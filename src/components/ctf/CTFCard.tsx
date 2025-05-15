
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CTF } from './types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface CTFCardProps {
  ctf: CTF;
  isPast?: boolean;
  onRegister?: (ctfId: number) => void;
}

export function getDifficultyColor(difficulty: string) {
  switch(difficulty) {
    case 'Principiante': return 'bg-green-500/20 text-green-500 border-green-500';
    case 'Intermedio': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
    case 'Avanzado': return 'bg-orange-500/20 text-orange-500 border-orange-500';
    case 'Experto': return 'bg-red-500/20 text-red-500 border-red-500';
    default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
  }
}

export function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Same day
  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  }
  
  // Different days
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

export function hasStarted(startDate: string) {
  return new Date(startDate) <= new Date();
}

export function getTimeRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Finalizado';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHrs}h restantes`;
  }
  return `${diffHrs}h ${diffMins}m restantes`;
}

const CTFCard: React.FC<CTFCardProps> = ({ ctf, isPast = false, onRegister }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para registrarte en un CTF.",
        variant: "default"
      });
      navigate('/auth');
      return;
    }

    if (onRegister) {
      onRegister(ctf.id);
    }
  };

  if (isPast) {
    return (
      <Card className="bg-cybersec-darkgray border-cybersec-darkgray overflow-hidden">
        <div className="h-36 relative">
          <img 
            src={ctf.image} 
            alt={ctf.name} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">{ctf.name}</h3>
              <Badge className={cn("border", getDifficultyColor(ctf.difficulty))}>
                {ctf.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="bg-black/50">
                {ctf.type}
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-gray-500">
                {ctf.format}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="mb-3">
            <p className="text-sm text-gray-400 line-clamp-2">{ctf.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div className="bg-cybersec-black p-2 rounded">
              <div className="text-xs text-gray-400 mb-0.5">Posición</div>
              <div className="font-semibold flex items-center">
                <Flag className="h-3.5 w-3.5 mr-1.5 text-cybersec-yellow" />
                {ctf.rank || "N/A"}/{ctf.totalParticipants || "N/A"}
              </div>
            </div>
            <div className="bg-cybersec-black p-2 rounded">
              <div className="text-xs text-gray-400 mb-0.5">Puntos</div>
              <div className="font-semibold">{ctf.userPoints || 0}/{ctf.maxPoints}</div>
            </div>
            <div className="bg-cybersec-black p-2 rounded">
              <div className="text-xs text-gray-400 mb-0.5">Participantes</div>
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                {ctf.participants}
              </div>
            </div>
            <div className="bg-cybersec-black p-2 rounded">
              <div className="text-xs text-gray-400 mb-0.5">Fecha</div>
              <div className="text-nowrap truncate">
                {new Date(ctf.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-400 cursor-not-allowed"
            disabled={true}
          >
            Detalles no disponibles
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-electricblue/50 transition-all overflow-hidden">
      <div className="h-48 relative">
        <img 
          src={ctf.image} 
          alt={ctf.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{ctf.name}</h3>
            <Badge className={cn("border", getDifficultyColor(ctf.difficulty))}>
              {ctf.difficulty}
            </Badge>
          </div>
          <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ctf.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-black/50">
              {ctf.type}
            </Badge>
            <Badge variant="outline" className="bg-black/50 border-gray-500">
              {ctf.format}
            </Badge>
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm">
          <div>
            <div className="text-gray-400">Organiza</div>
            <div>{ctf.organizer}</div>
          </div>
          <div>
            <div className="text-gray-400">Participantes</div>
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
              {ctf.participants}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Fecha</div>
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
              {new Date(ctf.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Desafíos</div>
            <div className="flex items-center">
              <Flag className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
              {ctf.challenges}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold">
            {hasStarted(ctf.startDate) 
              ? <span className="text-cybersec-neongreen">Disponible ahora</span>
              : <span className="text-cybersec-electricblue">Comienza en {Math.ceil((new Date(ctf.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días</span>
            }
          </div>
          <Button 
            className={ctf.registered 
              ? "border-cybersec-neongreen text-cybersec-neongreen bg-transparent hover:bg-cybersec-neongreen/10"
              : "bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80"}
            variant={ctf.registered ? "outline" : "default"}
            onClick={handleRegisterClick}
          >
            {ctf.registered ? 'Registrado' : 'Registrarse'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CTFCard;
