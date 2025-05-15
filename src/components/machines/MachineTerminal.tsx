
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { MachineApi } from './services/session/api';

interface MachineTerminalProps {
  onCommand: (command: string) => void;
  output: string[];
  isConnected: boolean;
  sessionId?: string;
  loading?: boolean;
  realConnection?: boolean;
}

const MachineTerminal: React.FC<MachineTerminalProps> = ({
  onCommand,
  output,
  isConnected,
  sessionId,
  loading = false,
  realConnection = false
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mantener el terminal desplazado hacia abajo
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);
  
  // Focus en el input al cargar
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading, isConnected]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || loading) return;
    
    // Guardar comando en el historial
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    if (realConnection && sessionId) {
      setIsExecuting(true);
      try {
        // Ejecutar comando real en la máquina
        const result = await MachineApi.executeCommand(sessionId, command);
        if (result.success) {
          // Mostrar salida del comando
          onCommand(command);
        } else {
          // Mostrar error
          onCommand(command);
          // El manejador de comandos mostrará el error
        }
      } catch (error) {
        console.error('Error executing command:', error);
      } finally {
        setIsExecuting(false);
      }
    } else {
      // Modo simulación
      onCommand(command);
    }
    
    setCommand('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navegar por el historial con las flechas arriba/abajo
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div 
      className="h-full bg-black font-mono text-sm text-green-500 rounded-md overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal output */}
      <div 
        ref={terminalRef}
        className="flex-1 p-2 overflow-y-auto"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-yellow-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Iniciando terminal...</span>
          </div>
        ) : !isConnected ? (
          <div className="text-red-400">
            <div>Conexión no establecida.</div>
            <div>Espere a que la máquina esté en estado 'running'.</div>
          </div>
        ) : (
          <>
            {output.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap ${
                line.startsWith('$') ? 'text-blue-400' : 
                line.startsWith('SUCCESS') ? 'text-green-500' : 
                line.startsWith('ERROR') ? 'text-red-500' :
                line.startsWith('INFO') ? 'text-yellow-500' : ''
              }`}>
                {line}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ejecutando...</span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Command input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-800">
        <div className="flex items-center px-2 py-1">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !isConnected || isExecuting}
            className="flex-1 bg-transparent border-none outline-none px-2 py-1 text-green-500"
            placeholder={loading || !isConnected ? '' : 'Ingrese un comando...'}
          />
        </div>
      </form>
    </div>
  );
};

export default MachineTerminal;
