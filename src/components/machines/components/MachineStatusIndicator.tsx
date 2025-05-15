
import React from 'react';
import { Shield, Server, AlertTriangle } from 'lucide-react';

interface MachineStatusIndicatorProps {
  status: string;
}

const MachineStatusIndicator: React.FC<MachineStatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'requested':
      return <div className="flex items-center"><Shield className="h-4 w-4 text-yellow-500 mr-1" /> Solicitada</div>;
    case 'provisioning':
      return <div className="flex items-center"><Server className="h-4 w-4 text-yellow-500 mr-1 animate-pulse" /> Iniciando</div>;
    case 'running':
      return <div className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-1" /> Activa</div>;
    case 'terminated':
      return <div className="flex items-center"><Shield className="h-4 w-4 text-gray-500 mr-1" /> Terminada</div>;
    case 'failed':
      return <div className="flex items-center"><AlertTriangle className="h-4 w-4 text-red-500 mr-1" /> Error</div>;
    default:
      return <div className="flex items-center"><Shield className="h-4 w-4 text-gray-500 mr-1" /> Desconocido</div>;
  }
};

export default MachineStatusIndicator;
