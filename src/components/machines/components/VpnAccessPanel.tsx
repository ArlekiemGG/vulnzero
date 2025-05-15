
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface VpnAccessPanelProps {
  isDownloadingVpn: boolean;
  vpnConfigAvailable: boolean;
  onDownload: () => void;
}

const VpnAccessPanel: React.FC<VpnAccessPanelProps> = ({ 
  isDownloadingVpn, 
  vpnConfigAvailable, 
  onDownload 
}) => {
  return (
    <div className="bg-cybersec-darkgray p-4 rounded-md">
      <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">VPN Access</h3>
      <p className="text-sm">Conéctate directamente desde tu equipo usando OpenVPN.</p>
      <Button 
        variant="outline"
        size="sm"
        className="mt-2 w-full border-cybersec-electricblue text-cybersec-electricblue"
        onClick={onDownload}
        disabled={isDownloadingVpn || !vpnConfigAvailable}
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloadingVpn ? "Descargando..." : "Descargar .ovpn"}
      </Button>
      {!vpnConfigAvailable && (
        <p className="text-xs text-amber-500 mt-1">
          La configuración VPN no está disponible para esta máquina.
        </p>
      )}
    </div>
  );
};

export default VpnAccessPanel;
