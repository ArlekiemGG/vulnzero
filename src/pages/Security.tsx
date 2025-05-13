
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Download, Lock, FileText, ExternalLink, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Mock data para estadísticas de usuario
const userStats = {
  level: 7,
  points: 3450,
  pointsToNextLevel: 550,
  progress: 70,
  rank: 42,
  solvedMachines: 15,
  completedChallenges: 8,
};

const securityScoreCategories = [
  { name: 'Contraseñas', score: 80 },
  { name: 'Autenticación', score: 60 },
  { name: 'Firewall', score: 90 },
  { name: 'Actualizaciones', score: 75 },
  { name: 'Antimalware', score: 85 }
];

const totalSecurityScore = Math.round(
  securityScoreCategories.reduce((sum, category) => sum + category.score, 0) / securityScoreCategories.length
);

const securityResources = [
  {
    id: 1,
    title: 'Guía de seguridad básica',
    description: 'Recomendaciones fundamentales para proteger tus dispositivos y cuentas.',
    type: 'guide',
    featured: true,
    downloads: 1245,
    updated: '2023-05-15'
  },
  {
    id: 2,
    title: 'Plantilla de política de seguridad',
    description: 'Documento base para crear una política de seguridad para organizaciones.',
    type: 'template',
    featured: false,
    downloads: 892,
    updated: '2023-04-22'
  },
  {
    id: 3,
    title: 'Lista de verificación: Protección contra ransomware',
    description: 'Pasos para prevenir y prepararse ante ataques de ransomware.',
    type: 'checklist',
    featured: true,
    downloads: 1536,
    updated: '2023-06-01'
  },
  {
    id: 4,
    title: 'Procedimiento de respuesta a incidentes',
    description: 'Marco de trabajo para responder eficazmente ante incidentes de seguridad.',
    type: 'procedure',
    featured: false,
    downloads: 745,
    updated: '2023-03-18'
  },
  {
    id: 5,
    title: 'Herramientas de monitorización recomendadas',
    description: 'Análisis comparativo de herramientas para monitorizar la seguridad de sistemas.',
    type: 'report',
    featured: false,
    downloads: 632,
    updated: '2023-05-02'
  },
  {
    id: 6,
    title: 'Implementación de autenticación multifactor',
    description: 'Guía paso a paso para implementar 2FA/MFA en diferentes servicios.',
    type: 'guide',
    featured: true,
    downloads: 1102,
    updated: '2023-05-28'
  }
];

const securityFAQs = [
  {
    question: '¿Cómo crear contraseñas seguras?',
    answer: 'Para crear contraseñas seguras, utiliza frases largas con una combinación de letras mayúsculas y minúsculas, números y caracteres especiales. Evita información personal fácil de adivinar y utiliza un gestor de contraseñas para almacenarlas de forma segura. Recuerda utilizar contraseñas diferentes para cada servicio.'
  },
  {
    question: '¿Qué es la autenticación de dos factores?',
    answer: 'La autenticación de dos factores (2FA) es un método de seguridad que requiere dos formas diferentes de identificación antes de conceder acceso. Generalmente combina algo que sabes (contraseña) con algo que tienes (código enviado a tu teléfono) o algo que eres (huella digital). Esto añade una capa adicional de seguridad, ya que incluso si tu contraseña es comprometida, el atacante necesitaría también el segundo factor.'
  },
  {
    question: '¿Cómo proteger mis dispositivos contra malware?',
    answer: 'Para proteger tus dispositivos contra malware: 1) Mantén tu sistema operativo y aplicaciones actualizados, 2) Utiliza software antimalware confiable, 3) Ten cuidado con los archivos adjuntos de correo electrónico y descargas, 4) No hagas clic en enlaces sospechosos, 5) Utiliza extensiones de navegador como bloqueadores de anuncios, 6) Realiza copias de seguridad regulares de tus datos importantes.'
  },
  {
    question: '¿Qué hacer si mi cuenta ha sido hackeada?',
    answer: 'Si tu cuenta ha sido comprometida: 1) Cambia inmediatamente la contraseña desde un dispositivo seguro, 2) Activa la autenticación de dos factores si está disponible, 3) Revisa la configuración de la cuenta para detectar cambios no autorizados, 4) Verifica si se han realizado acciones sospechosas, 5) Notifica a los contactos si es necesario, 6) Reporta el incidente al servicio correspondiente, 7) Monitorea tus cuentas para detectar actividad inusual.'
  },
  {
    question: '¿Cómo configurar correctamente un firewall?',
    answer: 'Para configurar correctamente un firewall: 1) Define claramente tus políticas de seguridad, 2) Implementa el principio de "denegar todo por defecto", 3) Permite solo el tráfico necesario para tus aplicaciones, 4) Documenta todas las reglas y sus propósitos, 5) Configura el registro de eventos y monitoriza regularmente, 6) Actualiza el firmware/software del firewall, 7) Realiza pruebas de penetración para verificar la efectividad de la configuración.'
  }
];

// Alertas de seguridad
const securityAlerts = [
  {
    id: 1,
    title: 'Actualización crítica disponible',
    description: 'Hay una actualización crítica de seguridad pendiente para uno de tus dispositivos.',
    severity: 'high',
    date: '2023-06-02'
  },
  {
    id: 2,
    title: 'Intento de inicio de sesión sospechoso',
    description: 'Detectamos un intento de inicio de sesión desde una ubicación desconocida.',
    severity: 'high',
    date: '2023-06-01'
  },
  {
    id: 3,
    title: 'Contraseña débil detectada',
    description: 'Una de tus contraseñas es considerada débil y debería ser cambiada.',
    severity: 'medium',
    date: '2023-05-28'
  }
];

const Security = () => {
  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSecurityScoreProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 border-green-500 bg-green-500/10';
      default: return 'text-gray-500 border-gray-500 bg-gray-500/10';
    }
  };

  const getResourceTypeIcon = (type) => {
    switch(type) {
      case 'guide': return <FileText className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      case 'checklist': return <CheckCircle className="h-4 w-4" />;
      case 'procedure': return <FileText className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Centro de Seguridad
              </h1>
              <p className="text-gray-400">
                Gestiona y mejora tu postura de seguridad
              </p>
            </header>

            {/* Alertas de seguridad */}
            {securityAlerts.length > 0 && (
              <div className="mb-6 space-y-3">
                {securityAlerts.map(alert => (
                  <Alert key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <span>{alert.description}</span>
                      <Button size="sm" className="bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80">
                        Resolver
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Puntuación de seguridad */}
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray col-span-1">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-cybersec-neongreen" />
                    <CardTitle className="text-cybersec-neongreen">Puntuación de Seguridad</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative w-36 h-36 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${getSecurityScoreColor(totalSecurityScore)}`}>
                          {totalSecurityScore}%
                        </span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="transparent" 
                          stroke="#1a1a1a" 
                          strokeWidth="8"
                        />
                        <circle 
                          cx="50" cy="50" r="45"
                          fill="transparent" 
                          stroke={totalSecurityScore >= 80 ? '#22c55e' : totalSecurityScore >= 60 ? '#eab308' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={`${2.8274 * totalSecurityScore} 282.74`}
                          strokeDashoffset="-70.686"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400">Tu puntuación de seguridad</span>
                  </div>

                  <div className="space-y-3">
                    {securityScoreCategories.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{category.name}</span>
                          <span className={getSecurityScoreColor(category.score)}>{category.score}%</span>
                        </div>
                        <Progress 
                          value={category.score} 
                          className={cn("h-1.5", getSecurityScoreProgressColor(category.score))}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                    Ver recomendaciones
                  </Button>
                </CardFooter>
              </Card>

              {/* Recursos de seguridad */}
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray col-span-1 lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-cybersec-electricblue">Recursos de Seguridad</CardTitle>
                    <Button variant="ghost" size="sm" className="text-cybersec-electricblue hover:text-cybersec-electricblue/80">
                      Ver todos
                    </Button>
                  </div>
                  <CardDescription>
                    Documentos, guías y plantillas para mejorar tu seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {securityResources.filter(r => r.featured).map(resource => (
                      <Card key={resource.id} className="bg-cybersec-black border-cybersec-darkgray/50 hover:border-cybersec-electricblue/50 transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getResourceTypeIcon(resource.type)}
                            {resource.title}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {resource.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center text-sm text-gray-400">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              <span>{resource.downloads}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="text-cybersec-electricblue hover:text-cybersec-electricblue/80">
                              Descargar
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="faqs" className="w-full">
              <TabsList className="mb-4 bg-cybersec-darkgray">
                <TabsTrigger 
                  value="faqs" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Preguntas frecuentes
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Recursos
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Configuración
                </TabsTrigger>
              </TabsList>

              {/* Tab de Preguntas frecuentes */}
              <TabsContent value="faqs">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cybersec-neongreen">Preguntas frecuentes de seguridad</CardTitle>
                    <CardDescription>
                      Respuestas a las dudas más comunes sobre seguridad informática
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {securityFAQs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="hover:text-cybersec-electricblue">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-400">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Recursos */}
              <TabsContent value="resources">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cybersec-neongreen">Biblioteca de recursos</CardTitle>
                    <CardDescription>
                      Documentos, guías y plantillas para mejorar tu seguridad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {securityResources.map(resource => (
                        <Card key={resource.id} className="bg-cybersec-black border-cybersec-darkgray/50 hover:border-cybersec-electricblue/50 transition-all">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              {getResourceTypeIcon(resource.type)}
                              {resource.title}
                            </CardTitle>
                            <CardDescription className="text-sm line-clamp-2">
                              {resource.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-2">
                            <div className="flex justify-between items-center w-full">
                              <div className="text-xs text-gray-400">
                                Actualizado: {resource.updated}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center text-sm text-gray-400">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  <span>{resource.downloads}</span>
                                </div>
                                <Button size="sm" variant="ghost" className="text-cybersec-electricblue hover:text-cybersec-electricblue/80">
                                  Descargar
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen">
                      Cargar más recursos
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Tab de Configuración */}
              <TabsContent value="settings">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cybersec-neongreen">Configuración de seguridad</CardTitle>
                    <CardDescription>
                      Administra tus preferencias de seguridad y privacidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          <Lock className="h-5 w-5 mr-2 text-cybersec-electricblue" />
                          Acceso y autenticación
                        </h3>
                        <div className="space-y-2 ml-7">
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Autenticación de dos factores</span>
                            <Button variant="outline" size="sm" className="border-cybersec-electricblue text-cybersec-electricblue">
                              Activar
                            </Button>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Cambiar contraseña</span>
                            <Button variant="outline" size="sm" className="border-cybersec-electricblue text-cybersec-electricblue">
                              Modificar
                            </Button>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Sesiones activas</span>
                            <Button variant="outline" size="sm" className="border-cybersec-electricblue text-cybersec-electricblue">
                              Ver sesiones
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-cybersec-darkgray/50" />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-cybersec-electricblue" />
                          Notificaciones de seguridad
                        </h3>
                        <div className="space-y-2 ml-7">
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Alertas de inicio de sesión</span>
                            <Button variant="outline" size="sm" className="border-green-500 text-green-500">
                              Activado
                            </Button>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Alertas de vulnerabilidades</span>
                            <Button variant="outline" size="sm" className="border-green-500 text-green-500">
                              Activado
                            </Button>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Resumen semanal de seguridad</span>
                            <Button variant="outline" size="sm" className="border-cybersec-electricblue text-cybersec-electricblue">
                              Activar
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="bg-cybersec-darkgray/50" />

                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-cybersec-electricblue" />
                          Privacidad y datos
                        </h3>
                        <div className="space-y-2 ml-7">
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Descarga de datos personales</span>
                            <Button variant="outline" size="sm" className="border-cybersec-electricblue text-cybersec-electricblue">
                              Descargar
                            </Button>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-cybersec-darkgray/50">
                            <span className="text-gray-300">Eliminar cuenta</span>
                            <Button variant="destructive" size="sm">
                              Solicitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cybersec-electricblue flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Enlaces externos útiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start text-left h-auto py-3 border-cybersec-electricblue text-cybersec-electricblue">
                      <div>
                        <div className="font-medium">INCIBE</div>
                        <div className="text-sm text-gray-400">Instituto Nacional de Ciberseguridad</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto py-3 border-cybersec-electricblue text-cybersec-electricblue">
                      <div>
                        <div className="font-medium">OWASP</div>
                        <div className="text-sm text-gray-400">Open Web Application Security Project</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto py-3 border-cybersec-electricblue text-cybersec-electricblue">
                      <div>
                        <div className="font-medium">CVE</div>
                        <div className="text-sm text-gray-400">Common Vulnerabilities and Exposures</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Security;
