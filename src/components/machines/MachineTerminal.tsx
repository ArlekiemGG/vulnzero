
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TerminalProps {
  onCommand: (command: string) => void;
  output: string[];
  isConnected: boolean;
  loading?: boolean;
}

const MachineTerminal: React.FC<TerminalProps> = ({
  onCommand,
  output,
  isConnected,
  loading = false,
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && isConnected) {
      onCommand(command);
      setHistory(prev => [...prev, command]);
      setHistoryIndex(-1);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <Card className="bg-cybersec-black border-cybersec-darkgray neon-border h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-cybersec-darkgray">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-cybersec-neongreen' : 'bg-cybersec-red'}`}></div>
            Terminal {isConnected ? 'Conectada' : 'Desconectada'}
          </div>
          {loading && <span className="text-xs text-cybersec-electricblue">Procesando...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <div 
          className="font-mono text-sm p-3 overflow-y-auto flex-grow bg-black/30 text-cybersec-neongreen"
          ref={terminalRef}
        >
          {output.length === 0 ? (
            isConnected ? (
              <div className="text-cybersec-electricblue italic">
                Conectado a la máquina. Escribe 'help' para ver comandos disponibles.
              </div>
            ) : (
              <div className="text-cybersec-red italic">
                Terminal sin conexión. Conecta a una máquina para comenzar.
              </div>
            )
          ) : (
            output.map((line, i) => (
              <div key={i} className="py-0.5">
                {line.startsWith('$') ? (
                  <span className="flex">
                    <span className="text-cybersec-electricblue mr-2">$</span>
                    <span>{line.substring(1)}</span>
                  </span>
                ) : line.startsWith('ERROR:') ? (
                  <span className="text-cybersec-red">{line}</span>
                ) : line.startsWith('SUCCESS:') ? (
                  <span className="text-cybersec-neongreen">{line.replace('SUCCESS:', '')}</span>
                ) : line.startsWith('INFO:') ? (
                  <span className="text-cybersec-electricblue">{line.replace('INFO:', '')}</span>
                ) : (
                  line
                )}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-2 border-t border-cybersec-darkgray flex">
          <div className="text-cybersec-electricblue mr-2 self-center">$</div>
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "Escribe un comando..." : "Terminal desconectada"}
            disabled={!isConnected || loading}
            className="border-none bg-transparent focus-visible:ring-0 text-cybersec-neongreen font-mono flex-grow"
            autoComplete="off"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!isConnected || !command.trim() || loading}
            className="ml-2 bg-cybersec-darkgray hover:bg-cybersec-neongreen text-cybersec-neongreen hover:text-black"
          >
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MachineTerminal;
