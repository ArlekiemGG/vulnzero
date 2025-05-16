
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cybersec-black border-t border-cybersec-darkgray py-8 text-gray-400 static bottom-0 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="h-8 w-8 text-cybersec-neongreen mr-2" />
            <span className="text-cybersec-neongreen font-bold text-xl">VulnZero</span>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="hover:text-cybersec-neongreen transition-colors" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-cybersec-neongreen transition-colors" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="#" className="hover:text-cybersec-neongreen transition-colors" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-cybersec-darkgray pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-cybersec-neongreen font-medium text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link to="/machines" className="hover:text-white transition-colors">Máquinas</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Cursos</Link></li>
                <li><Link to="/challenges" className="hover:text-white transition-colors">Desafíos</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cybersec-neongreen font-medium text-lg mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guías</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cybersec-neongreen font-medium text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Uso aceptable</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-cybersec-darkgray text-sm text-center">
            <p>© {new Date().getFullYear()} VulnZero. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
