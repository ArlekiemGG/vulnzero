
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

const CreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 100,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  
  useEffect(() => {
    document.title = "Crear Curso - VulnZero";
    
    // Check if user is admin
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !data || data.role !== 'admin') {
        toast({
          title: "Acceso denegado",
          description: "No tienes permiso para crear cursos",
          variant: "destructive",
        });
        navigate('/courses');
      }
    };

    // Fetch user stats for sidebar
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Get basic profile data
        const { data } = await supabase
          .from('profiles')
          .select('level, points, rank, completed_challenges')
          .eq('id', user.id)
          .single();
          
        if (data) {
          // Calculate points needed for next level (simplified formula)
          const pointsToNextLevel = data.level * 100;
          const progress = Math.min(Math.floor((data.points / pointsToNextLevel) * 100), 100);
          
          // Get solved machines count
          const { count: solvedMachines } = await supabase
            .from('user_machine_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          setUserStats({
            level: data.level || 1,
            points: data.points || 0,
            pointsToNextLevel,
            progress,
            rank: data.rank || 0,
            solvedMachines: solvedMachines || 0,
            completedChallenges: data.completed_challenges || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    
    if (user) {
      checkAdmin();
      fetchUserStats();
    }
  }, [user, navigate]);
  
  const createFundamentalsCourse = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting course creation process");
      
      // 1. Create the course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: "Fundamentos de Ciberseguridad",
          description: "Un curso introductorio que cubre los conceptos esenciales de la ciberseguridad, desde amenazas comunes hasta buenas prácticas de seguridad.",
          image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2674&q=80",
          level: "principiante",
          category: "ciberseguridad",
          instructor: "Equipo VulnZero",
          duration_minutes: 180
        })
        .select()
        .single();
      
      if (courseError) {
        console.error("Error creating course:", courseError);
        throw courseError;
      }
      
      if (!courseData) {
        throw new Error("No se pudo crear el curso - no se devolvieron datos");
      }
      
      console.log("Course created successfully:", courseData);
      
      // 2. Create the section
      const { data: sectionData, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseData.id,
          title: "Módulo: Fundamentos de Ciberseguridad",
          position: 1
        })
        .select()
        .single();
      
      if (sectionError) {
        console.error("Error creating section:", sectionError);
        throw sectionError;
      }
      
      if (!sectionData) {
        throw new Error("No se pudo crear la sección del curso - no se devolvieron datos");
      }
      
      console.log("Section created successfully:", sectionData);
      
      // 3. Create the lessons
      const lessons = [
        {
          section_id: sectionData.id,
          title: "¿Qué es la ciberseguridad?",
          content: `# ¿Qué es la ciberseguridad?

Objetivo: Comprender qué es la ciberseguridad y por qué es importante.

La ciberseguridad es el conjunto de técnicas, procesos y herramientas diseñadas para proteger sistemas informáticos, redes, dispositivos y datos frente a accesos no autorizados, ataques o daños.

🌐 Todo lo que está conectado a internet es vulnerable. Desde un teléfono móvil hasta un servidor corporativo.

## Áreas clave de la ciberseguridad:

- Seguridad de red
- Seguridad de aplicaciones
- Seguridad de la información
- Seguridad operativa
- Recuperación ante desastres

## ¿Por qué importa?
Los ciberataques pueden provocar pérdida de datos, robo de identidad, daños económicos, reputacionales y más. La ciberseguridad protege la confidencialidad, integridad y disponibilidad de la información (el famoso triángulo CIA).`,
          position: 1,
          duration_minutes: 20
        },
        {
          section_id: sectionData.id,
          title: "Tipos de amenazas comunes",
          content: `# Tipos de amenazas comunes

Objetivo: Conocer los tipos de ataques más frecuentes.

## Tipos de amenazas principales:

- **Malware**: software malicioso como virus, troyanos, spyware.
- **Phishing**: intento de engañar al usuario para que revele información confidencial.
- **Ransomware**: secuestra archivos y pide rescate.
- **Ataques de fuerza bruta**: prueban contraseñas hasta encontrar la correcta.
- **Ingeniería social**: manipulación psicológica para obtener acceso.

🔐 La mayoría de ataques exitosos ocurren porque alguien cometió un error humano.`,
          position: 2,
          duration_minutes: 25
        },
        {
          section_id: sectionData.id,
          title: "¿Qué es el hacking ético?",
          content: `# ¿Qué es el hacking ético?

Objetivo: Entender el rol del hacker ético y sus diferencias con un atacante.

El hacking ético (también llamado "pentesting") es el proceso legal y autorizado de evaluar la seguridad de un sistema informático mediante la simulación de ataques reales.

## Tipos de hackers:

- 🟢 **White hat**: Hackers éticos.
- ⚫ **Black hat**: Ciberdelincuentes.
- ⚪ **Gray hat**: Están entre lo legal y lo ilegal.

Los hackers éticos ayudan a prevenir ataques, no a causarlos.`,
          position: 3,
          duration_minutes: 30
        },
        {
          section_id: sectionData.id,
          title: "Conceptos básicos de redes",
          content: `# Conceptos básicos de redes

Objetivo: Familiarizarse con los fundamentos de redes.

## Conceptos esenciales:

- **IP (Internet Protocol)**: Identifica cada dispositivo en una red.
- **DNS**: Traduce nombres de dominio a IPs.
- **Firewall**: Filtra el tráfico de red.
- **Puertos**: "Puertas" por donde se comunican los servicios (ej: puerto 80 para HTTP).
- **Protocolos**: Reglas de comunicación (ej: TCP/IP, HTTP, FTP).

🧪 Saber escanear puertos es una de las primeras habilidades que se aprende en ciberseguridad.`,
          position: 4,
          duration_minutes: 35
        },
        {
          section_id: sectionData.id,
          title: "Introducción a Linux y la línea de comandos",
          content: `# Introducción a Linux y la línea de comandos

Objetivo: Aprender los comandos básicos de Linux, el sistema operativo más usado en hacking ético.

## Comandos esenciales:

- **pwd**: muestra la ruta actual.
- **ls**: lista archivos.
- **cd**: cambia de directorio.
- **mkdir**: crea carpetas.
- **nano**: editor de texto.
- **chmod** y **chown**: administración de permisos.

🐧 Linux es el sistema favorito en ciberseguridad por su control, transparencia y flexibilidad.`,
          position: 5,
          duration_minutes: 40
        },
        {
          section_id: sectionData.id,
          title: "Buenas prácticas de seguridad",
          content: `# Buenas prácticas de seguridad

Objetivo: Conocer hábitos clave para mejorar la seguridad personal y organizacional.

## Prácticas recomendadas:

- Usar contraseñas fuertes (mezcla de mayúsculas, minúsculas, números y símbolos).
- Activar 2FA (doble verificación).
- Mantener software actualizado.
- No hacer clic en enlaces sospechosos.
- Usar VPN en redes públicas.
- Realizar backups regularmente.`,
          position: 6,
          duration_minutes: 30
        }
      ];
      
      for (const lesson of lessons) {
        console.log(`Creating lesson: ${lesson.title}`);
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert(lesson);
        
        if (lessonError) {
          console.error(`Error creating lesson "${lesson.title}":`, lessonError);
        } else {
          console.log(`Lesson "${lesson.title}" created successfully`);
        }
      }
      
      toast({
        title: "¡Curso creado con éxito!",
        description: "El curso de Fundamentos de Ciberseguridad ha sido añadido a la plataforma",
      });
      
      navigate(`/courses/${courseData.id}`);
      
    } catch (error) {
      console.error("Error al crear el curso:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el curso. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <Sidebar userStats={userStats} />
      
      <main className="flex-1 pt-16 px-4 md:px-8 md:ml-64">
        <div className="container py-8 mx-auto">
          <h1 className="text-3xl font-bold mb-8">Crear Curso</h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Fundamentos de Ciberseguridad</h2>
                <p className="text-gray-300 mb-4">
                  Curso introductorio que cubre los conceptos básicos de la ciberseguridad,
                  desde tipos de amenazas hasta buenas prácticas de seguridad.
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Nivel: Principiante • 6 lecciones • 3 horas
                </p>
                
                <Button 
                  onClick={createFundamentalsCourse} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creando curso...' : 'Crear curso de Fundamentos de Ciberseguridad'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;
