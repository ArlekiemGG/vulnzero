
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Activity, X } from 'lucide-react';
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
  completedTasksIds?: number[];
  onTaskUpdate?: (taskId: number, completed: boolean) => Promise<void>;
}

const MachineProgress: React.FC<MachineProgressProps> = ({ 
  tasks, 
  isLoading,
  completedTasksIds = [],
  onTaskUpdate
}) => {
  // Calculate progress percentage based on completed tasks
  const completedTasks = tasks.filter(task => {
    // Check if the task is marked as completed or if its ID is in the completedTasksIds array
    return task.completed || completedTasksIds.includes(task.id);
  }).length;
  
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
          {tasks.map((task) => {
            // Determine if the task is completed based on both task.completed and completedTasksIds
            const isCompleted = task.completed || completedTasksIds.includes(task.id);
            
            return (
              <div 
                key={task.id} 
                className={`p-3 rounded flex items-start ${
                  isCompleted ? 'bg-green-900/20 border border-green-700/50' : 'bg-cybersec-black'
                }`}
                onClick={() => onTaskUpdate && onTaskUpdate(task.id, !isCompleted)}
                role={onTaskUpdate ? "button" : "region"}
                tabIndex={onTaskUpdate ? 0 : undefined}
                aria-pressed={isCompleted}
              >
                <div className={`mt-0.5 p-1 rounded-full ${isCompleted ? 'bg-green-700/50' : 'bg-cybersec-darkgray'} mr-3`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-cybersec-electricblue'}`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>
              </div>
            );
          })}

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
