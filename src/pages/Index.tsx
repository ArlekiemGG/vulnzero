
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Database, Trophy, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-cybersec-black pt-40 pb-20 px-4 sm:px-6 lg:pt-48 lg:pb-28 lg:px-8 border-b border-cybersec-darkgray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-cybersec-neongreen sm:text-5xl md:text-6xl">
              <span className="glitch-text">VulnZero</span>
            </h1>
            <h2 className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-5">
              Aprende ciberseguridad resolviendo máquinas vulnerables en un entorno gamificado
            </h2>
            
            <div className="mt-8 flex justify-center gap-4">
              {user ? (
                <Button asChild size="lg" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80 animate-pulse-neon">
                  <Link to="/dashboard">Mi Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80 animate-pulse-neon">
                  <Link to="/auth">Comenzar ahora</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue/10">
                <Link to="/machines">Ver máquinas</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1),transparent_40%)]"></div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 px-4 sm:px-6 lg:py-24 lg:px-8 bg-cybersec-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-cybersec-neongreen sm:text-4xl">
              Características principales
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Todo lo que necesitas para convertirte en un experto en ciberseguridad
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-cybersec-darkgray p-6 rounded-lg border border-cybersec-darkgray hover:neon-border transition-all">
              <div className="bg-cybersec-black p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-cybersec-neongreen" />
              </div>
              <h3 className="text-lg font-medium text-cybersec-neongreen mb-2">Laboratorios Virtuales</h3>
              <p className="text-gray-300">
                Entornos Docker configurados para practicar técnicas de hacking ético en un ambiente seguro.
              </p>
            </div>

            <div className="bg-cybersec-darkgray p-6 rounded-lg border border-cybersec-darkgray hover:neon-border transition-all">
              <div className="bg-cybersec-black p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-cybersec-neongreen" />
              </div>
              <h3 className="text-lg font-medium text-cybersec-neongreen mb-2">Máquinas Vulnerables</h3>
              <p className="text-gray-300">
                Explota vulnerabilidades en sistemas configurados con diferentes niveles de dificultad.
              </p>
            </div>

            <div className="bg-cybersec-darkgray p-6 rounded-lg border border-cybersec-darkgray hover:neon-border transition-all">
              <div className="bg-cybersec-black p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-cybersec-neongreen" />
              </div>
              <h3 className="text-lg font-medium text-cybersec-neongreen mb-2">Gamificación</h3>
              <p className="text-gray-300">
                Gana puntos, sube de nivel y consigue insignias mientras aprendes conceptos avanzados de seguridad.
              </p>
            </div>

            <div className="bg-cybersec-darkgray p-6 rounded-lg border border-cybersec-darkgray hover:neon-border transition-all">
              <div className="bg-cybersec-black p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Flag className="h-6 w-6 text-cybersec-neongreen" />
              </div>
              <h3 className="text-lg font-medium text-cybersec-neongreen mb-2">Desafíos semanales</h3>
              <p className="text-gray-300">
                Participa en competiciones semanales para poner a prueba tus habilidades y competir con otros hackers.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            {user ? (
              <Button asChild size="lg" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                <Link to="/dashboard">Mi Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                <Link to="/auth">Empezar ahora</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Añadimos una nueva sección para mejorar SEO */}
      <div className="py-12 px-4 sm:px-6 lg:py-20 lg:px-8 bg-cybersec-black border-t border-cybersec-darkgray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-cybersec-neongreen sm:text-4xl">
              Aprende Ciberseguridad con VulnZero
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              La plataforma definitiva para desarrollar tus habilidades en seguridad informática
            </p>
          </div>
          
          <div className="mt-10 prose prose-lg max-w-4xl mx-auto text-gray-300">
            <p>
              VulnZero es una plataforma innovadora diseñada para profesionales de la ciberseguridad, estudiantes y entusiastas que desean mejorar sus habilidades prácticas en un entorno seguro y controlado.
            </p>
            <p>
              A través de nuestra colección de máquinas vulnerables, desafíos CTF y laboratorios prácticos, los usuarios pueden poner a prueba sus conocimientos en un entorno que simula escenarios reales de ciberataques y vulnerabilidades.
            </p>
            <p>
              Nuestro enfoque gamificado hace que el aprendizaje sea divertido y motivador, permitiéndote ganar puntos, insignias y subir en el ranking mientras aumentas tus habilidades técnicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
