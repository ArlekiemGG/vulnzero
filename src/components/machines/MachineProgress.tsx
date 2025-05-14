
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface MachineTask {
  id: number;
  title: string;  // Note: in MachineService.ts this is referred to as 'name'
  description: string;
  completed: boolean;
}

interface MachineProgressProps {
  tasks: MachineTask[];
  isLoading: boolean;
}

const MachineProgress: React.FC<MachineProgressProps> = ({ tasks, isLoading }) => {
  // Calculate progress percentage based on completed tasks
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Progreso</h3>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded bg-cybersec-black h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-cybersec-neongreen mb-4">Progreso</h3>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Completado</span>
            <span className="text-sm font-medium text-cybersec-neongreen">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {tasks.map((task) => (
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

          {tasks.length === 0 && (
            <div className="text-center p-4 bg-cybersec-black rounded">
              <p className="text-gray-400">No hay tareas disponibles para esta máquina.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineProgress;
