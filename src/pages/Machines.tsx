
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, HardDrive, Network, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { MachineService } from '@/components/machines/MachineService';
import { MachineType } from '@/components/machines/MachineData';

const Machines = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [osFilter, setOsFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [userProgress, setUserProgress] = useState({});
  const [machines, setMachines] = useState<MachineType[]>([]);

  useEffect(() => {
    // Obtener todas las máquinas disponibles
    const fetchMachines = () => {
      const allMachines = MachineService.getAllMachines();
      setMachines(allMachines);
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    // Simula la obtención del progreso del usuario para cada máquina
    const fetchUserProgress = async () => {
      const progressData = {};
      machines.forEach(machine => {
        progressData[machine.id] = machine.userProgress || Math.floor(Math.random() * 101); // Usa el progreso existente o simula uno
      });
      setUserProgress(progressData);
    };

    if (machines.length > 0) {
      fetchUserProgress();
    }
  }, [machines]);

  const filteredMachines = useMemo(() => {
    return machines
      .filter(machine => {
        if (osFilter === 'all') return true;
        return machine.osType === osFilter;
      })
      .filter(machine => {
        if (difficultyFilter === 'all') return true;
        return machine.difficulty === difficultyFilter;
      })
      .filter(machine => {
        if (!searchQuery) return true;
        return machine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               machine.description.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [machines, osFilter, difficultyFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      
      <main className="pt-20 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado y filtros */}
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">Máquinas</h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Buscar máquinas..."
                className="bg-cybersec-darkgray text-white flex-grow md:flex-grow-0"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              
              <div className="flex items-center gap-2">
                <Label htmlFor="osFilter" className="text-sm text-gray-400">
                  Sistema Operativo:
                </Label>
                <Select value={osFilter} onValueChange={setOsFilter}>
                  <SelectTrigger className="w-[180px] bg-cybersec-darkgray text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-cybersec-darkgray text-white">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="linux">Linux</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="difficultyFilter" className="text-sm text-gray-400">
                  Dificultad:
                </Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[150px] bg-cybersec-darkgray text-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-cybersec-darkgray text-white">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                    <SelectItem value="insane">Insano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Listado de máquinas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map(machine => (
              <Card key={machine.id} className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardContent className="p-6">
                  <div className="relative h-40 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={machine.image} 
                      alt={machine.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white">{machine.name}</h3>
                    </div>
                  </div>
                  
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
                  
                  <p className="text-sm text-gray-300 mb-4">{machine.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{machine.osType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{machine.difficulty}</span>
                    </div>
                    {user && (
                      <div className="flex items-center gap-1">
                        <Network className="h-3 w-3" />
                        <span>{machine.points} Puntos</span>
                      </div>
                    )}
                  </div>
                  
                  {user && (
                    <>
                      <div className="text-xs text-gray-400 mb-1">Progreso: {userProgress[machine.id]}%</div>
                      <Progress value={userProgress[machine.id]} className="mb-4" />
                    </>
                  )}
                  
                  <Button asChild className="w-full bg-cybersec-black border border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue hover:text-black">
                    <Link to={`/machines/${machine.id}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Machines;
