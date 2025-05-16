
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-cybersec-black border-t border-cybersec-darkgray py-8 text-gray-400 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-6 md:mb-0">
            <Shield className="h-8 w-8 text-cybersec-neongreen mr-2" />
            <span className="text-cybersec-neongreen font-bold text-xl">VulnZero</span>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://twitter.com/vulnzero" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cybersec-neongreen transition-colors duration-300" 
              aria-label="Twitter"
            >
              <Twitter size={22} />
            </a>
            <a 
              href="https://github.com/vulnzero" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cybersec-neongreen transition-colors duration-300" 
              aria-label="GitHub"
            >
              <Github size={22} />
            </a>
            <a 
              href="https://linkedin.com/company/vulnzero" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cybersec-neongreen transition-colors duration-300" 
              aria-label="LinkedIn"
            >
              <Linkedin size={22} />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 py-6 border-t border-cybersec-darkgray">
          <div>
            <h3 className="text-cybersec-neongreen font-medium text-lg mb-3">Plataforma</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors duration-300">Inicio</Link></li>
              <li><Link to="/machines" className="hover:text-white transition-colors duration-300">Máquinas</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors duration-300">Cursos</Link></li>
              <li><Link to="/challenges" className="hover:text-white transition-colors duration-300">Desafíos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cybersec-neongreen font-medium text-lg mb-3">Recursos</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:text-white transition-colors duration-300">Blog</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors duration-300">Documentación</Link></li>
              <li><Link to="/guides" className="hover:text-white transition-colors duration-300">Guías</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors duration-300">Soporte</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cybersec-neongreen font-medium text-lg mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-white transition-colors duration-300">Términos de servicio</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors duration-300">Política de privacidad</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-white transition-colors duration-300">Uso aceptable</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-cybersec-darkgray text-sm text-center">
          <p className="mb-1">© {currentYear} VulnZero. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-600">La plataforma de entrenamiento en ciberseguridad diseñada para profesionales.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
