
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bug, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Ruta inaccesible:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cybersec-black p-4">
      <div className="text-center max-w-md">
        <div className="inline-block p-4 rounded-full bg-cybersec-darkgray mb-6">
          <Bug className="h-16 w-16 text-cybersec-red animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-cybersec-neongreen mb-4 glitch-text">Error 404</h1>
        
        <p className="text-xl text-gray-300 mb-6">
          No pudimos encontrar la ruta <span className="font-mono text-cybersec-electricblue">{location.pathname}</span>
        </p>
        
        <p className="text-gray-400 mb-8">
          Parece que esta dirección ha sido eliminada o nunca existió. 
          Quizás alguien la sanitizó demasiado bien.
        </p>
        
        <Button asChild className="bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black">
          <Link to="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
