import React, { useState, useEffect } from 'react';
import { MachineSessionService } from './MachineSessionService';
import { Button } from '@/components/ui/button';
import { RefreshCw, Send } from 'lucide-react';

interface MachineTerminalProps {
  sessionId?: string;
  onRefresh?: () => void;
  onCommand?: (command: string) => void;
  output?: string[];
  isConnected?: boolean;
}

const MachineTerminal: React.FC<MachineTerminalProps> = ({ 
  sessionId,
  onRefresh,
  onCommand,
  output: externalOutput,
  isConnected
}) => {
  const [command, setCommand] = useState<string>('');
  const [output, setOutput] = useState<string[]>(externalOutput || ['Terminal ready. Type commands below.']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Update internal output state when external output changes
  useEffect(() => {
    if (externalOutput) {
      setOutput(externalOutput);
    }
  }, [externalOutput]);
  
  // Initial connection check - only if we have a sessionId
  useEffect(() => {
    if (!sessionId) return;
    
    const checkConnection = async () => {
      try {
        const result = await MachineSessionService.executeCommand(
          sessionId,
          'echo "Terminal connection established"'
        );
        
        if (result.success) {
          setOutput(['Terminal connected. Type commands below.']);
        } else {
          setOutput(['Error connecting to terminal. Please try again or refresh.']);
        }
      } catch (error) {
        console.error('Terminal connection error:', error);
        setOutput(['Connection error. The machine may still be starting up.']);
      }
    };
    
    checkConnection();
  }, [sessionId]);
  
  const handleExecuteCommand = async () => {
    if (!command.trim()) return;
    
    try {
      setIsLoading(true);
      setOutput(prev => [...prev, `$ ${command}`]);
      const currentCommand = command;
      setCommand('');
      
      // If we have an onCommand prop, use that
      if (onCommand) {
        onCommand(currentCommand);
      } 
      // Otherwise use the session-based execution if we have a sessionId
      else if (sessionId) {
        const result = await MachineSessionService.executeCommand(sessionId, currentCommand);
        
        if (result.success) {
          // Split output by newlines to display correctly
          const outputLines = result.output.split('\n');
          setOutput(prev => [...prev, ...outputLines]);
        } else {
          setOutput(prev => [...prev, `Error: ${result.output}`]);
        }
      }
    } catch (error) {
      console.error('Command execution error:', error);
      setOutput(prev => [...prev, 'Command execution failed. Try again.']);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setOutput(['Refreshing connection...']);
    
    if (onRefresh) {
      onRefresh();
      return;
    }
    
    if (!sessionId) {
      setOutput(['No session ID provided. Cannot refresh.']);
      return;
    }
    
    try {
      const result = await MachineSessionService.executeCommand(
        sessionId,
        'echo "Connection refreshed"'
      );
      
      if (result.success) {
        setOutput(['Connection refreshed. Terminal ready.']);
      } else {
        setOutput(['Error refreshing connection.']);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setOutput(['Refresh failed. The machine may be unavailable.']);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-cybersec-darkgray text-sm">
        <div>Web Terminal {isConnected === false ? "(Disconnected)" : ""}</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2" 
          onClick={handleRefresh}
          disabled={isConnected === false}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex-grow p-3 font-mono text-xs overflow-auto bg-cybersec-darkblack text-green-400">
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">{line}</div>
        ))}
      </div>
      
      <div className="flex border-t border-cybersec-darkerborder">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
          className="flex-grow bg-cybersec-darkgray py-2 px-3 font-mono text-sm outline-none border-0"
          placeholder={isConnected === false ? "Terminal disconnected" : "Type command..."}
          disabled={isLoading || isConnected === false}
        />
        <Button 
          variant="ghost"
          className="h-10 px-3 rounded-none"
          onClick={handleExecuteCommand}
          disabled={isLoading || isConnected === false}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MachineTerminal;
