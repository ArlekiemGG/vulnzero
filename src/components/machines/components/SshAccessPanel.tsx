
import React from 'react';

interface SshAccessPanelProps {
  ipAddress: string;
  username: string;
  password: string;
  sshPort: number;
}

const SshAccessPanel: React.FC<SshAccessPanelProps> = ({ 
  ipAddress, 
  username, 
  password, 
  sshPort 
}) => {
  return (
    <div className="bg-cybersec-darkgray p-4 rounded-md">
      <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">SSH Access</h3>
      <div className="text-sm font-mono bg-cybersec-black p-2 rounded">
        ssh {username}@{ipAddress} -p {sshPort}
      </div>
      <div className="mt-2 text-sm">
        <p>Username: <span className="font-mono">{username}</span></p>
        <p>Password: <span className="font-mono">{password}</span></p>
      </div>
    </div>
  );
};

export default SshAccessPanel;
