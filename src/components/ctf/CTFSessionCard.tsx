
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, Calendar, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CTFSession } from './types';
import { getDifficultyColor, formatDateRange, getTimeRemaining } from './CTFCard';

interface CTFSessionCardProps {
  session: CTFSession;
}

const CTFSessionCard: React.FC<CTFSessionCardProps> = ({ session }) => {
  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Swords className="h-5 w-5 text-cybersec-yellow" />
          <CardTitle className="text-cybersec-yellow">CTF en progreso</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="h-48 rounded-lg overflow-hidden mb-3">
              <img 
                src={session.image} 
                alt={session.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-400">Formato</div>
                <div>{session.format}</div>
              </div>
              <div>
                <div className="text-gray-400">Tipo</div>
                <div>{session.type}</div>
              </div>
              <div>
                <div className="text-gray-400">Desafíos</div>
                <div>{session.challenges}</div>
              </div>
              <div>
                <div className="text-gray-400">Participantes</div>
                <div>{session.participants}</div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-cybersec-yellow">{session.name}</h3>
                <Badge className={cn("border", getDifficultyColor(session.difficulty))}>
                  {session.difficulty}
                </Badge>
              </div>
              <p className="text-gray-400 mb-4">{session.description}</p>
              
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-cybersec-yellow" />
                  <span>{formatDateRange(session.startDate, session.endDate)}</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-cybersec-yellow">
                  <Timer className="h-4 w-4 mr-2" />
                  <span>{getTimeRemaining(session.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tu progreso</span>
                  <span className="text-cybersec-yellow">
                    {session.userPoints} / {session.maxPoints} puntos
                  </span>
                </div>
                <Progress 
                  value={(session.userPoints / session.maxPoints) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button className="bg-cybersec-yellow text-cybersec-black hover:bg-cybersec-yellow/80 flex-1">
                  Continuar CTF
                </Button>
                <Button variant="outline" className="border-cybersec-yellow text-cybersec-yellow">
                  Ver clasificación
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CTFSessionCard;
