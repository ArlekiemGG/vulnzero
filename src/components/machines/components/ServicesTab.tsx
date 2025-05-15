
import React from 'react';
import { MachineService, MachineVulnerability } from '../services/session/types';

interface ServicesTabProps {
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services = [], vulnerabilities = [] }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">Servicios detectados</h3>
        {services && services.length > 0 ? (
          <div className="bg-cybersec-black p-3 rounded-md overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-cybersec-darkerborder">
                  <th className="text-left py-2 px-3 text-cybersec-electricblue">Servicio</th>
                  <th className="text-left py-2 px-3 text-cybersec-electricblue">Puerto</th>
                  <th className="text-left py-2 px-3 text-cybersec-electricblue">Estado</th>
                  <th className="text-left py-2 px-3 text-cybersec-electricblue">Versión</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-cybersec-darkgray/20' : ''}>
                    <td className="py-2 px-3 font-mono">{service.nombre}</td>
                    <td className="py-2 px-3 font-mono">{service.puerto}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        service.estado === 'open' ? 'bg-green-900/30 text-green-500' : 
                        service.estado === 'filtered' ? 'bg-yellow-900/30 text-yellow-500' :
                        'bg-red-900/30 text-red-500'
                      }`}>
                        {service.estado}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{service.version || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-cybersec-black p-4 rounded-md text-center text-gray-400">
            No se han detectado servicios aún
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-cybersec-electricblue mb-2">Vulnerabilidades potenciales</h3>
        {vulnerabilities && vulnerabilities.length > 0 ? (
          <div className="space-y-2">
            {vulnerabilities.map((vuln, index) => (
              <div key={index} className="bg-cybersec-black p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{vuln.nombre}</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    vuln.severidad === 'crítica' ? 'bg-red-900/30 text-red-500' : 
                    vuln.severidad === 'alta' ? 'bg-orange-900/30 text-orange-500' :
                    vuln.severidad === 'media' ? 'bg-yellow-900/30 text-yellow-500' :
                    'bg-blue-900/30 text-blue-500'
                  }`}>
                    {vuln.severidad}
                  </span>
                </div>
                {vuln.cve && <div className="text-xs font-mono text-cybersec-electricblue mt-1">{vuln.cve}</div>}
                {vuln.descripcion && <div className="text-xs mt-1">{vuln.descripcion}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-cybersec-black p-4 rounded-md text-center text-gray-400">
            No se han detectado vulnerabilidades aún
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesTab;
