
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Flag, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  startDate: string;
  endDate: string;
  participants: number;
  isActive: boolean;
  isCompleted?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const {
    id,
    title,
    description,
    category,
    points,
    startDate,
    endDate,
    participants,
    isActive,
    isCompleted,
  } = challenge;

  // Formato de fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className={`border ${isActive ? 'border-cybersec-electricblue' : 'border-cybersec-darkgray'} bg-cybersec-darkgray relative`}>
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-cybersec-neongreen text-cybersec-black text-xs font-bold px-2 py-0.5 rounded-full">
          Completado
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-cybersec-neongreen">
            {title}
          </CardTitle>
          <Badge 
            className={`${
              isActive ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {isActive ? 'Activo' : 'Próximamente'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300">{description}</p>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-cybersec-black text-cybersec-electricblue border-cybersec-electricblue">
            {category}
          </Badge>
          
          <div className="flex items-center ml-auto">
            <Trophy className="h-4 w-4 text-cybersec-yellow mr-1" />
            <span className="font-mono">{points} pts</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-2 text-cybersec-electricblue" />
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>
          <div className="flex items-center">
            <Flag className="h-3.5 w-3.5 mr-2 text-cybersec-electricblue" />
            {participants} participantes
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className={`w-full ${
            isActive 
              ? 'bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black' 
              : 'bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isActive}
          asChild={isActive}
        >
          {isActive ? (
            <Link to={`/challenges/${id}`}>
              {isCompleted ? 'Ver detalles' : 'Aceptar desafío'}
            </Link>
          ) : (
            <span>No disponible</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
