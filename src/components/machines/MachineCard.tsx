
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, ArrowRight, Star, Server
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface MachineProps {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  solvedBy: number;
  userProgress: number;
  image: string;
  osType: 'windows' | 'linux' | 'other';
  featured?: boolean;
  hasActiveSession?: boolean;
}

const DifficultyBadge: React.FC<{ difficulty: 'easy' | 'medium' | 'hard' | 'insane' }> = ({ difficulty }) => {
  const classes = {
    easy: 'bg-green-950 text-green-500 border-green-500',
    medium: 'bg-yellow-950 text-yellow-500 border-yellow-500',
    hard: 'bg-red-950 text-red-500 border-red-500',
    insane: 'bg-purple-950 text-purple-500 border-purple-500',
  };

  return (
    <Badge variant="outline" className={classes[difficulty]}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};

const MachineCard: React.FC<MachineProps> = ({
  id,
  name,
  description,
  difficulty,
  categories,
  points,
  solvedBy,
  userProgress,
  image,
  osType,
  featured = false,
  hasActiveSession = false,
}) => {
  const borderClass = featured 
    ? 'neon-border-purple animate-pulse-neon' 
    : hasActiveSession 
    ? 'neon-border-green' 
    : 'border-cybersec-darkgray hover:neon-border';

  console.log(`Rendering MachineCard for machine: ${name} with ID: ${id}`);

  return (
    <Card className={`bg-cybersec-darkgray ${borderClass} transition-all duration-300`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-cybersec-neongreen flex items-center space-x-2">
            {name}
            {featured && (
              <Star className="h-4 w-4 fill-cybersec-yellow text-cybersec-yellow ml-2" />
            )}
            {hasActiveSession && (
              <Server className="h-4 w-4 fill-green-500 text-green-500 ml-2" />
            )}
          </CardTitle>
          <DifficultyBadge difficulty={difficulty} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-4">
          <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden bg-cybersec-black">
            <img 
              src={image || "/placeholder.svg"} 
              alt={name} 
              className="object-cover h-full w-full opacity-70 hover:opacity-100 transition-opacity"
            />
            <Badge 
              variant="outline" 
              className={`absolute top-2 right-2 ${
                osType === 'linux' ? 'border-cybersec-neongreen text-cybersec-neongreen' :
                osType === 'windows' ? 'border-cybersec-electricblue text-cybersec-electricblue' :
                'border-gray-500 text-gray-500'
              }`}
            >
              {osType}
            </Badge>
            {hasActiveSession && (
              <Badge 
                className="absolute top-2 left-2 bg-green-600"
              >
                Sesión Activa
              </Badge>
            )}
          </AspectRatio>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
          
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="bg-cybersec-black text-cybersec-electricblue border-cybersec-electricblue">
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between items-center text-sm pt-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-cybersec-yellow" />
              <span>{points} pts</span>
            </div>
            <span className="text-gray-400">{solvedBy} usuarios</span>
          </div>
          
          {userProgress > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progreso</span>
                <span>{userProgress}%</span>
              </div>
              <Progress value={userProgress} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${
            hasActiveSession 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
          }`} 
          asChild
        >
          <Link to={`/machines/${id}`} className="flex items-center justify-center gap-2">
            Ver detalles <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineCard;
