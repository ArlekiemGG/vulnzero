
import React from 'react';
import SshAccessPanel from './SshAccessPanel';
import VpnAccessPanel from './VpnAccessPanel';

interface ConnectionDetailsProps {
  machineSession: {
    status: string;
    username?: string; // Make username optional
    password?: string; // Add password as optional
    ipAddress?: string; // Make ipAddress optional
    connectionInfo?: {
      puertoSSH?: number;
    };
    vpnConfigAvailable?: boolean;
  };
  isDownloadingVpn: boolean;
  onDownloadVpn: () => void;
}

const ConnectionDetails: React.FC<ConnectionDetailsProps> = ({ 
  machineSession,
  isDownloadingVpn,
  onDownloadVpn
}) => {
  if (machineSession.status === 'running') {
    return (
      <div className="mt-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <SshAccessPanel 
            ipAddress={machineSession.ipAddress || ''}
            username={machineSession.username || ''}
            password={machineSession.password || ''}
            sshPort={machineSession.connectionInfo?.puertoSSH || 22}
          />
          
          <VpnAccessPanel
            isDownloadingVpn={isDownloadingVpn}
            vpnConfigAvailable={!!machineSession.vpnConfigAvailable}
            onDownload={onDownloadVpn}
          />
        </div>
      </div>
    );
  }
  
  return null;
};

export default ConnectionDetails;
