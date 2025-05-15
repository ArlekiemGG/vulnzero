
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Flag, Swords, Trophy, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const CTFGuideCard: React.FC = () => {
  const handleResourcesClick = () => {
    // Update to a working CTF resources URL
    window.open('https://ctftime.org/ctf-wtf/', '_blank');
  };

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-cybersec-electricblue" />
          <CardTitle className="text-cybersec-electricblue">Guía para CTFs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="bg-cybersec-black p-2 rounded-full mr-3">
              <Flag className="h-4 w-4 text-cybersec-electricblue" />
            </div>
            <div>
              <h4 className="font-medium mb-1">¿Qué es un CTF?</h4>
              <p className="text-sm text-gray-400">
                Capture The Flag es una competición de seguridad donde los participantes resuelven desafíos para encontrar "flags" ocultas.
              </p>
            </div>
          </div>
          <Separator className="bg-cybersec-darkgray/50" />
          <div className="flex items-start">
            <div className="bg-cybersec-black p-2 rounded-full mr-3">
              <Swords className="h-4 w-4 text-cybersec-electricblue" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Tipos de CTF</h4>
              <p className="text-sm text-gray-400">
                <span className="text-cybersec-electricblue">Jeopardy:</span> Desafíos independientes por categorías. <br />
                <span className="text-cybersec-electricblue">Attack-Defense:</span> Equipos protegen sus sistemas mientras atacan otros.
              </p>
            </div>
          </div>
          <Separator className="bg-cybersec-darkgray/50" />
          <div className="flex items-start">
            <div className="bg-cybersec-black p-2 rounded-full mr-3">
              <Trophy className="h-4 w-4 text-cybersec-electricblue" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Consejos para competir</h4>
              <p className="text-sm text-gray-400">
                Forma un equipo con habilidades diversas, documenta lo que intentas, y no te rindas con los desafíos más difíciles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80"
          onClick={handleResourcesClick}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Recursos para CTFs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CTFGuideCard;
