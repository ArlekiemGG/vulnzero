
import { StaticCourseContent, StaticSection, StaticLesson } from '../types';

// Mapeo de IDs de cursos a sus archivos de contenido
const courseContentMap: Record<string, StaticCourseContent> = {
  'course-1': {
    id: 'course-1',
    title: 'Introducción a la Ciberseguridad',
    sections: [
      {
        id: 'section-1-1',
        title: 'Fundamentos de Seguridad',
        lessons: [
          {
            id: 'lesson-1-1-1',
            title: 'Principios básicos de la seguridad informática',
            content: `
# Principios básicos de la seguridad informática

La seguridad informática se basa en tres principios fundamentales:

## Confidencialidad
La información solo debe ser accesible para las personas autorizadas.

## Integridad
La información debe mantenerse precisa y completa, sin modificaciones no autorizadas.

## Disponibilidad
La información debe estar disponible para los usuarios autorizados cuando la necesiten.

Estos tres principios forman el modelo CIA (Confidentiality, Integrity, Availability), que es la base de la seguridad informática moderna.
            `,
            duration_minutes: 15
          },
          {
            id: 'lesson-1-1-2',
            title: 'Tipos de amenazas informáticas',
            content: `
# Tipos de amenazas informáticas

Las amenazas informáticas pueden clasificarse en varias categorías:

## Malware
- Virus
- Troyanos
- Ransomware
- Spyware
- Adware

## Ataques de red
- Denegación de servicio (DoS)
- Ataques de intermediario (MitM)
- Ataques de inyección SQL
- Cross-Site Scripting (XSS)

## Ingeniería social
- Phishing
- Pretexting
- Baiting
- Quid pro quo

Comprender estos tipos de amenazas es fundamental para desarrollar estrategias de defensa efectivas.
            `,
            duration_minutes: 20
          }
        ]
      },
      {
        id: 'section-1-2',
        title: 'Seguridad en la Web',
        lessons: [
          {
            id: 'lesson-1-2-1',
            title: 'Vulnerabilidades web comunes',
            content: `
# Vulnerabilidades web comunes

Las aplicaciones web están expuestas a numerosas vulnerabilidades:

## Inyección SQL
Ocurre cuando un atacante puede insertar código SQL malicioso en consultas que la aplicación envía a la base de datos.

## Cross-Site Scripting (XSS)
Permite a los atacantes inyectar scripts del lado del cliente en páginas web vistas por otros usuarios.

## Cross-Site Request Forgery (CSRF)
Fuerza a un usuario final a ejecutar acciones no deseadas en una aplicación web en la que está actualmente autenticado.

## Exposición de datos sensibles
Ocurre cuando una aplicación no protege adecuadamente datos sensibles como contraseñas, información financiera o datos personales.

## Configuración incorrecta de seguridad
Incluye configuraciones por defecto inseguras, directorios abiertos, mensajes de error que revelan demasiada información, etc.
            `,
            duration_minutes: 25
          }
        ]
      }
    ]
  },
  'course-2': {
    id: 'course-2',
    title: 'Hacking Ético',
    sections: [
      {
        id: 'section-2-1',
        title: 'Fundamentos del Hacking Ético',
        lessons: [
          {
            id: 'lesson-2-1-1',
            title: '¿Qué es el hacking ético?',
            content: `
# ¿Qué es el hacking ético?

El hacking ético es el proceso de penetrar en sistemas informáticos y redes para identificar posibles amenazas y vulnerabilidades. A diferencia del hacking malicioso, esta práctica se realiza con el permiso explícito del propietario del sistema.

## Objetivos del hacking ético
- Identificar vulnerabilidades antes que los atacantes maliciosos
- Mejorar la seguridad de los sistemas informáticos
- Prevenir brechas de seguridad
- Proteger datos sensibles

## Tipos de pruebas de penetración
1. **Pruebas de caja negra**: El hacker no tiene conocimiento previo del sistema
2. **Pruebas de caja blanca**: El hacker tiene conocimiento completo del sistema
3. **Pruebas de caja gris**: El hacker tiene conocimiento parcial del sistema

El hacking ético requiere un profundo conocimiento técnico y un fuerte código ético para asegurar que las actividades realizadas no crucen líneas legales o morales.
            `,
            duration_minutes: 20
          }
        ]
      }
    ]
  },
  'seguridad-personal': {
    id: 'seguridad-personal',
    title: 'Seguridad Personal Digital',
    sections: [
      {
        id: 'fundamentos-seguridad-personal',
        title: 'Fundamentos de Seguridad Personal',
        lessons: [
          {
            id: 'pilares-seguridad',
            title: 'Los Pilares de la Seguridad Digital Personal',
            content: `
# Los Pilares de la Seguridad Digital Personal

La seguridad digital personal se basa en varios principios fundamentales que todos deberían comprender y aplicar en su vida diaria.

## Confidencialidad
La confidencialidad se refiere a mantener tus datos personales, comunicaciones y actividades en línea privadas y accesibles solo para ti y aquellos a quienes eliges permitir el acceso.

### Prácticas para mantener la confidencialidad:
- Usar contraseñas fuertes y únicas para cada cuenta
- Implementar cifrado en tus dispositivos y comunicaciones
- Compartir información personal solo en sitios seguros y confiables
- Revisar regularmente la configuración de privacidad en tus cuentas

## Integridad
La integridad se refiere a mantener tus datos precisos, completos y libres de modificaciones no autorizadas.

### Prácticas para mantener la integridad:
- Verificar la autenticidad de los sitios que visitas (buscar HTTPS)
- Hacer copias de seguridad regulares de tus datos importantes
- Utilizar software antivirus y anti-malware actualizados
- Verificar la procedencia de los archivos antes de descargarlos

## Disponibilidad
La disponibilidad significa asegurar que puedas acceder a tus datos, servicios y recursos cuando los necesites.

### Prácticas para mantener la disponibilidad:
- Mantener copias redundantes de datos importantes
- Usar servicios en la nube confiables para almacenar respaldos
- Implementar planes de recuperación ante desastres
- Proteger tus cuentas contra ataques que puedan bloquear tu acceso

## Autenticidad
La autenticidad implica verificar que las personas e información con las que interactúas son genuinas y no impostoras.

### Prácticas para mantener la autenticidad:
- Verificar la identidad de los contactos nuevos en línea
- Comprobar la fuente de los correos electrónicos antes de responder
- Usar firmas digitales cuando sea apropiado
- Desconfiar de ofertas que parecen demasiado buenas para ser verdad

Estos pilares constituyen la base para construir una sólida postura de seguridad personal en el mundo digital. A medida que avancemos en el curso, veremos cómo implementar estos principios en situaciones cotidianas.
            `,
            duration_minutes: 25
          },
          {
            id: 'evaluacion-riesgos',
            title: 'Evaluación de Riesgos Personales',
            content: `
# Evaluación de Riesgos Personales

Antes de implementar medidas de seguridad, es crucial entender qué estamos protegiendo y de qué amenazas. Este proceso se conoce como evaluación de riesgos personales.

## Identificación de Activos Digitales

Un activo digital es cualquier información o recurso que tiene valor para ti:

### Activos de Información
- Documentos personales (pasaporte, DNI digitalizado)
- Información financiera (datos bancarios, inversiones)
- Registros médicos
- Fotografías y videos personales
- Correos electrónicos y mensajes privados

### Activos de Acceso
- Contraseñas y credenciales
- Cuentas en redes sociales
- Accesos bancarios online
- Perfiles profesionales
- Dispositivos (smartphone, laptop, tablet)

## Análisis de Amenazas

Una vez identificados tus activos, es necesario determinar qué amenazas podrían afectarlos:

### Amenazas Externas
- Cibercriminales (phishing, malware, ransomware)
- Hackers (dirigidos o aleatorios)
- Empresas recopilando datos (minado de datos, publicidad dirigida)
- Vigilancia (gubernamental o corporativa)

### Amenazas Internas
- Errores propios (eliminar archivos, compartir información sensible)
- Configuración incorrecta de privacidad
- Dispositivos sin protección
- Compartir contraseñas o dispositivos con otras personas

## Evaluación de Vulnerabilidades

Las vulnerabilidades son debilidades que las amenazas pueden explotar:

- **Técnicas**: software desactualizado, ausencia de cifrado, redes WiFi inseguras
- **Humanas**: falta de conocimiento, fatiga de decisiones, exceso de confianza
- **Físicas**: dispositivos sin bloqueo, trabajo en lugares públicos, pantallas visibles

## Matriz de Riesgos Personales

Una forma simple de evaluar tus riesgos es crear una matriz que combine:

1. **Probabilidad**: ¿Qué tan probable es que ocurra?
   - Alta: Ocurre frecuentemente
   - Media: Ocurre ocasionalmente
   - Baja: Raramente ocurre

2. **Impacto**: ¿Qué tan grave sería si ocurriera?
   - Alto: Pérdida significativa (financiera, reputacional, privacidad)
   - Medio: Inconveniente considerable pero recuperable
   - Bajo: Molestia menor

### Ejemplo de matriz:

| Amenaza | Probabilidad | Impacto | Nivel de Riesgo |
|---------|--------------|---------|-----------------|
| Phishing | Alta | Alto | Crítico |
| Pérdida de smartphone | Media | Alto | Alto |
| Contraseña débil | Alta | Medio | Alto |
| Malware | Media | Medio | Medio |

## Plan de Mitigación

Basado en tu evaluación, puedes crear un plan para mitigar los riesgos más significativos:

1. **Riesgos críticos**: Requieren acción inmediata (cambiar contraseñas, activar 2FA)
2. **Riesgos altos**: Planificar acción a corto plazo (cifrar dispositivos, actualizar software)
3. **Riesgos medios**: Programar mejoras (revisiones periódicas, mejores prácticas)
4. **Riesgos bajos**: Monitorear pero sin acción inmediata

Recuerda que la evaluación de riesgos no es un evento único sino un proceso continuo que debe revisarse periódicamente a medida que cambian tus circunstancias digitales y el panorama de amenazas.
            `,
            duration_minutes: 30
          },
          {
            id: 'huella-digital',
            title: 'Tu Huella Digital e Identidad Online',
            content: `
# Tu Huella Digital e Identidad Online

La huella digital es el rastro de datos que dejamos al navegar por internet, usar aplicaciones y participar en plataformas digitales. Esta huella forma nuestra identidad en línea y puede tener consecuencias significativas en nuestra vida personal y profesional.

## Tipos de Huella Digital

### Huella Digital Activa
Es la información que compartimos voluntariamente:
- Publicaciones en redes sociales
- Comentarios en blogs y foros
- Fotos y videos subidos
- Información de perfil en distintas plataformas
- Reseñas y valoraciones

### Huella Digital Pasiva
Es la información recopilada sin nuestra participación activa:
- Historiales de navegación
- Cookies y rastreadores
- Metadatos en fotos y documentos
- Registros de ubicación
- Datos de uso de aplicaciones
- Compras en línea y patrones de consumo

## Impacto de tu Huella Digital

### Oportunidades
- **Profesionales**: Empleadores revisan perfiles de candidatos
- **Académicas**: Instituciones educativas evalúan perfiles de solicitantes
- **Sociales**: Nuevas conexiones personales basan impresiones iniciales en tu presencia online
- **Financieras**: Algunas instituciones incluyen datos de redes sociales en evaluaciones de crédito

### Riesgos
- **Robo de identidad**: Suficiente información pública facilita la suplantación
- **Discriminación**: Contenido controversial puede afectar oportunidades
- **Acoso**: Exceso de información personal facilita el cyberbullying o stalking
- **Reputación dañada**: Contenido inapropiado puede persistir por años
- **Perfilado comercial**: Manipulación a través de marketing hiperpersonalizado

## Auditoría de tu Huella Digital

Es recomendable realizar una revisión periódica de tu presencia digital:

1. **Búsqueda de nombre**: Usa diferentes motores de búsqueda (Google, Bing, DuckDuckGo)
2. **Búsqueda de imágenes**: Verifica qué fotos tuyas aparecen públicamente
3. **Revisión de redes sociales**: Examina el contenido visible para extraños
4. **Revisa cuentas olvidadas**: Identifica servicios antiguos donde aún tengas registros
5. **Solicita tus datos**: Ejerce tu derecho a solicitar información a empresas que tengan tus datos

## Gestión de tu Identidad Digital

### Estrategias Proactivas
- **Construye conscientemente**: Genera contenido que refleje valores y competencias positivas
- **Equilibra privacidad y presencia**: No es necesario desaparecer, sino gestionar conscientemente
- **Mantén separación contextual**: Considera diferentes cuentas para distintos aspectos de tu vida

### Limpieza Digital
- **Elimina contenido inapropiado**: Borra publicaciones que no reflejen tu identidad actual
- **Cierra cuentas no utilizadas**: Reduce tu superficie de exposición
- **Solicita eliminación de información**: Contacta a sitios web que muestren datos personales no deseados
- **Utiliza el "derecho al olvido"**: En algunas jurisdicciones puedes pedir a buscadores que desindexen contenido

### Construyendo una Presencia Positiva
- Publica contenido profesional relevante
- Participa en comunidades de interés constructivamente
- Demuestra conocimiento y habilidades a través de tu actividad digital
- Mantén consistencia en tu mensaje y valores

Recuerda que tu huella digital es acumulativa y persistente, pero con las estrategias adecuadas puedes gestionarla para que sea un activo y no un obstáculo en tu vida.
            `,
            duration_minutes: 35
          }
        ]
      },
      {
        id: 'contraseñas-autenticacion',
        title: 'Contraseñas y Autenticación',
        lessons: [
          {
            id: 'contraseñas-seguras',
            title: 'Creación de Contraseñas Seguras',
            content: `
# Creación de Contraseñas Seguras

Las contraseñas son la primera línea de defensa para proteger tus cuentas digitales. Crear contraseñas seguras es fundamental para prevenir accesos no autorizados.

## Problemas con las Contraseñas Comunes

### Contraseñas Débiles
Las contraseñas más utilizadas siguen siendo extremadamente inseguras:
- Contraseñas secuenciales como "123456" o "abcdef"
- Palabras comunes como "contraseña" o "admin"
- Información personal evidente como "nacimiento1990" o "nombreapellido"
- Patrones de teclado como "qwerty" o "asdfgh"

### Vulnerabilidades
- **Ataques de diccionario**: Prueban palabras comunes
- **Ataques de fuerza bruta**: Prueban todas las combinaciones posibles
- **Filtración de datos**: Las contraseñas expuestas en brechas de seguridad
- **Ingeniería social**: Obtención de contraseñas mediante manipulación psicológica

## Principios para Contraseñas Seguras

### Longitud
- La longitud es más importante que la complejidad
- Mínimo recomendado: 12-16 caracteres
- Cada caracter adicional aumenta exponencialmente la seguridad

### Complejidad
- Combina diferentes tipos de caracteres:
  - Letras mayúsculas (A-Z)
  - Letras minúsculas (a-z)
  - Números (0-9)
  - Símbolos especiales (!@#$%^&*)

### Unicidad
- Nunca reutilices contraseñas entre servicios
- Si una cuenta es comprometida, las demás permanecen seguras

### Aleatoriedad
- Evita patrones reconocibles o palabras comunes
- No utilices información personal fácilmente deducible

## Métodos para Crear Contraseñas Seguras

### Método de Frase de Paso
1. Elige una frase que puedas recordar: "Mi gato Felix come atún todos los martes"
2. Toma la primera letra de cada palabra: "MgFcatlm"
3. Añade números y símbolos: "MgF3c@tlm!"
4. Resulta en una contraseña difícil de adivinar pero fácil de recordar

### Método Diceware
1. Usa dados para seleccionar palabras de una lista predefinida
2. Combina 4-6 palabras aleatorias: "correcto caballo batería grapa"
3. Añade elementos para aumentar la entropía: "correcto7caballo&batería!grapa"

### Generadores de Contraseñas
- Utiliza generadores de contraseñas aleatorias incluidos en gestores de contraseñas
- Ajusta parámetros como longitud y tipos de caracteres según necesidades

## Evaluación de Tus Contraseñas

### Fortaleza
- Una contraseña fuerte debe resistir:
  - Millones de intentos por segundo (ataques de fuerza bruta)
  - Análisis basados en patrones lingüísticos
  - Técnicas de ingeniería inversa

### Tiempo de Descifrado
Con tecnología actual:
- Contraseña de 6 caracteres: minutos u horas
- Contraseña de 8 caracteres: días o semanas
- Contraseña de 12 caracteres: años o décadas
- Contraseña de 16+ caracteres: prácticamente imposible

## Renovación de Contraseñas

### Frecuencia de Cambio
- Cambiar contraseñas ante:
  - Sospechas de compromiso
  - Notificaciones de brechas de datos
  - Uso en dispositivos no seguros
  - Compartirla con alguien (incluso temporalmente)

### Renovación Inteligente
- Evita cambios menores (ej. añadir un número al final)
- Implementa cambios significativos en cada renovación

Recuerda que una contraseña fuerte es solo el primer paso. En el siguiente tema, exploraremos cómo los gestores de contraseñas pueden ayudarte a implementar estas prácticas de forma sostenible y conveniente.
            `,
            duration_minutes: 30
          },
          {
            id: 'gestores-contraseñas',
            title: 'Gestores de Contraseñas',
            content: `
# Gestores de Contraseñas

Los gestores de contraseñas son herramientas diseñadas para almacenar, generar y administrar tus contraseñas de forma segura. Son la solución al dilema moderno de necesitar decenas de contraseñas complejas y únicas sin tener que memorizarlas todas.

## ¿Por qué usar un gestor de contraseñas?

### Problema de la memoria
- El cerebro humano no está diseñado para recordar decenas de contraseñas complejas
- La persona promedio tiene entre 70-100 cuentas online que requieren contraseñas

### Soluciones inadecuadas
- Reutilizar la misma contraseña (riesgo de comprometer múltiples cuentas)
- Usar contraseñas simples (vulnerables a ataques)
- Anotar contraseñas en papel o archivos sin protección
- Guardarlas en el navegador sin protección adicional

## Funcionamiento de los gestores de contraseñas

### Principios básicos
- Todas tus contraseñas se almacenan en una "bóveda" cifrada
- Accedes a la bóveda con una única "contraseña maestra"
- La información cifrada solo puede descifrarse con tu contraseña maestra

### Seguridad implementada
- **Cifrado AES-256**: Estándar militar prácticamente imposible de descifrar
- **Zero-knowledge**: El proveedor no puede acceder a tus contraseñas
- **Autorrelleno**: Detecta sitios web y completa credenciales automáticamente

## Tipos de gestores de contraseñas

### Basados en la nube
- **Ventajas**: Accesibles desde cualquier dispositivo, sincronización automática
- **Ejemplos**: LastPass, 1Password, Bitwarden, Dashlane
- **Consideraciones**: Dependen de la seguridad del proveedor, requieren conexión para algunas funciones

### Locales
- **Ventajas**: Datos almacenados solo en tus dispositivos, control total
- **Ejemplos**: KeePass, KeePassXC
- **Consideraciones**: Responsabilidad de realizar copias de seguridad, sincronización manual

### Integrados en navegadores
- **Ventajas**: Convenientes, no requieren instalación
- **Ejemplos**: Chrome Password Manager, Firefox Lockwise
- **Consideraciones**: Generalmente menos funcionales, vinculados al ecosistema del navegador

## Características clave a considerar

### Esenciales
- Generador de contraseñas aleatorias
- Cifrado robusto (AES-256 o superior)
- Autorrelleno de formularios
- Sincronización entre dispositivos
- Copias de seguridad

### Avanzadas
- Autenticación de dos factores para la contraseña maestra
- Alertas de brechas de seguridad
- Compartir contraseñas de forma segura
- Almacenamiento de otros datos sensibles (tarjetas, notas seguras)
- Auditoría de seguridad de contraseñas

## Implementación de un gestor de contraseñas

### Primeros pasos
1. Seleccionar un gestor que se adapte a tus necesidades
2. Crear una contraseña maestra extremadamente fuerte (y memorable)
3. Configurar recuperación de emergencia (preguntas de seguridad, contactos de confianza)
4. Instalar extensiones en navegadores y aplicaciones en dispositivos

### Migración de contraseñas existentes
1. Importar contraseñas guardadas en navegadores
2. Añadir cuentas manualmente durante inicios de sesión
3. Programar actualizaciones de contraseñas débiles o duplicadas
4. Activar la detección automática de cambios de contraseña

## Buenas prácticas

### Contraseña maestra
- Debe ser la contraseña más fuerte que tengas
- Considerar usar una frase de paso larga (4-5 palabras mínimo)
- Nunca reutilizarla en ningún otro servicio
- Considerarla información crítica (como el PIN de tu tarjeta)

### Seguridad adicional
- Activar autenticación de dos factores para el gestor
- Configurar tiempo de cierre automático (1-5 minutos)
- Revisar regularmente informes de seguridad del gestor
- Mantener actualizada la aplicación del gestor

### Plan de contingencia
- Preparar un método para recuperación si olvidas la contraseña maestra
- Mantener backup cifrado en ubicación segura
- Considerar compartir acceso de emergencia con persona de confianza

Los gestores de contraseñas simplifican enormemente la tarea de mantener una buena higiene de contraseñas, permitiéndote usar contraseñas únicas y complejas sin el esfuerzo de memorizarlas todas.
            `,
            duration_minutes: 40
          },
          {
            id: 'autenticacion-dos-factores',
            title: 'Autenticación de Dos Factores (2FA)',
            content: `
# Autenticación de Dos Factores (2FA)

La autenticación de dos factores (2FA) o verificación en dos pasos añade una capa adicional de seguridad a tus cuentas, requiriendo no solo algo que sabes (tu contraseña) sino también algo que tienes (como tu teléfono) para verificar tu identidad.

## Factores de autenticación

La seguridad moderna utiliza tres categorías principales de factores:

### Algo que sabes
- **Contraseñas y frases de paso**
- PINs
- Respuestas a preguntas de seguridad

### Algo que tienes
- **Dispositivos móviles** (para recibir códigos)
- Llaves de seguridad físicas (como YubiKey)
- Tarjetas inteligentes
- Tokens de hardware

### Algo que eres
- Huellas dactilares
- Reconocimiento facial
- Escaneo de retina
- Reconocimiento de voz

La autenticación de dos factores combina dos de estas categorías, típicamente "algo que sabes" (contraseña) con "algo que tienes" (dispositivo móvil).

## Tipos de 2FA

### Basados en tiempo (TOTP)
- **Cómo funciona**: Genera códigos que cambian cada 30 segundos
- **Ejemplos**: Google Authenticator, Authy, Microsoft Authenticator
- **Ventajas**: No requiere conexión a Internet, inmune a interceptación de SMS
- **Desventajas**: Si pierdes acceso a la app, recuperación más compleja

### SMS y llamadas telefónicas
- **Cómo funciona**: Envía códigos por mensaje de texto o llamada
- **Ventajas**: Facilidad de uso, ampliamente soportado
- **Desventajas**: Vulnerable a interceptación, SIM swapping, problemas de recepción

### Llaves de seguridad físicas
- **Cómo funciona**: Dispositivo USB o NFC que verifica identidad
- **Ejemplos**: YubiKey, Google Titan Security Key
- **Ventajas**: Alta seguridad, resistente a phishing, sin baterías
- **Desventajas**: Costo adicional, necesidad de llevarlas físicamente

### Aplicaciones de aprobación
- **Cómo funciona**: Notificación push a tu dispositivo para aprobar/denegar
- **Ejemplos**: Microsoft Authenticator, Duo Mobile
- **Ventajas**: Experiencia sencilla, sin necesidad de ingresar códigos
- **Desventajas**: Requiere conexión a internet en el dispositivo

### Biométricos
- **Cómo funciona**: Usa características físicas únicas para verificar
- **Ejemplos**: Huella digital, Face ID
- **Ventajas**: Conveniente, difícil de falsificar
- **Desventajas**: Menos privado, posibilidad de falsos positivos/negativos

## Implementación de 2FA

### Priorización de cuentas
Es recomendable activar 2FA primero en estas cuentas:
1. Correo electrónico principal (puerta de entrada a otras cuentas)
2. Servicios financieros (bancos, inversiones, criptomonedas)
3. Redes sociales con información personal
4. Almacenamiento en la nube
5. Gestores de contraseñas

### Procedimiento habitual
1. Acceder a configuración de seguridad de la cuenta
2. Activar verificación en dos pasos/autenticación de dos factores
3. Escanear código QR con la aplicación autenticadora
4. Guardar códigos de respaldo en lugar seguro
5. Verificar funcionamiento con un inicio de sesión de prueba

## Gestión de 2FA

### Administradores de 2FA
- Aplicaciones como Authy permiten sincronizar 2FA entre dispositivos
- Algunos gestores de contraseñas integran función TOTP

### Códigos de respaldo
- Son esenciales en caso de perder acceso al dispositivo
- Guardarlos en formato físico y/o digital cifrado
- Considerar almacenarlos en gestor de contraseñas o caja fuerte

### Dispositivos de respaldo
- Configura 2FA en más de un dispositivo cuando sea posible
- Considera tener un teléfono de respaldo configurado

## Consideraciones de seguridad

### Ventajas de 2FA
- Protege contra filtración de contraseñas
- Dificulta enormemente los ataques de fuerza bruta
- Alerta sobre intentos de acceso no autorizados

### Limitaciones
- No es completamente infalible (especialmente SMS)
- Puede generar fricción en la experiencia de usuario
- Riesgo de bloqueo si se pierden todos los factores

### Posibles problemas
- Cambio de número de teléfono
- Pérdida o robo del dispositivo
- Viajes internacionales (problemas con SMS)
- Fallos en servicios de autenticación

## Recomendaciones avanzadas

### Múltiples métodos
- Configura varios métodos de 2FA cuando sea posible
- Prioriza TOTP o llaves físicas sobre SMS

### Seguridad familiar
- Ayuda a miembros de la familia a configurar 2FA
- Considera planes para acceso de emergencia

### Verificación continua
- Algunos servicios ofrecen autenticación continua y contextual
- Analiza comportamiento, ubicación y dispositivo durante toda la sesión

La autenticación de dos factores es una de las medidas más efectivas que puedes implementar para proteger tus cuentas digitales, con un balance óptimo entre seguridad y conveniencia.
            `,
            duration_minutes: 35
          }
        ]
      }
    ]
  }
};

// Función para normalizar IDs
const normalizeId = (id: string): string => {
  return id.replace(/-/g, '').toLowerCase();
};

// Creamos un mapa de IDs normalizados para buscar cursos de manera más flexible
const createNormalizedIdMap = (): Record<string, string> => {
  const normalizedMap: Record<string, string> = {};
  
  Object.keys(courseContentMap).forEach(courseId => {
    const normalizedId = normalizeId(courseId);
    normalizedMap[normalizedId] = courseId;
  });
  
  return normalizedMap;
};

const normalizedIdMap = createNormalizedIdMap();

// Servicio para gestionar el contenido estático de los cursos
export const StaticContentService = {
  /**
   * Obtiene el contenido estático de un curso
   * @param courseId ID del curso
   * @returns Contenido estático del curso o null si no existe
   */
  getCourseContent: (courseId: string): StaticCourseContent | null => {
    if (!courseId) {
      console.error('Error: courseId es undefined o null');
      return null;
    }
    
    console.log(`StaticContentService: Buscando curso con ID: "${courseId}"`);
    
    // Comprobamos si el courseId existe exactamente como está
    if (courseContentMap[courseId]) {
      console.log(`StaticContentService: Curso encontrado con ID exacto: ${courseId}`);
      return courseContentMap[courseId];
    }
    
    // Si no se encontró, intentamos buscar de forma más flexible
    const courseIds = Object.keys(courseContentMap);
    const matchedId = courseIds.find(id => id.toLowerCase() === courseId.toLowerCase());
    
    if (matchedId) {
      console.log(`StaticContentService: Curso encontrado con coincidencia flexible: ${matchedId} para búsqueda: ${courseId}`);
      return courseContentMap[matchedId];
    }
    
    // Si sigue sin encontrarse, mostramos todos los IDs disponibles para depuración
    console.error(`StaticContentService: Curso no encontrado con ID: "${courseId}". IDs disponibles: ${courseIds.join(', ')}`);
    return null;
  },

  /**
   * Busca un curso por su ID normalizado
   * @param normalizedId ID del curso normalizado (sin guiones, todo en minúsculas)
   * @returns Contenido estático del curso o null si no existe
   */
  findCourseByNormalizedId: (normalizedId: string): StaticCourseContent | null => {
    const originalId = normalizedIdMap[normalizedId];
    
    if (originalId) {
      console.log(`StaticContentService: Curso encontrado con ID normalizado: ${normalizedId} -> ${originalId}`);
      return courseContentMap[originalId];
    }
    
    console.error(`StaticContentService: Curso no encontrado con ID normalizado: "${normalizedId}". IDs normalizados disponibles: ${Object.keys(normalizedIdMap).join(', ')}`);
    return null;
  },

  /**
   * Obtiene el contenido estático de una lección
   * @param courseId ID del curso
   * @param lessonId ID de la lección
   * @returns Contenido estático de la lección o null si no existe
   */
  getLessonContent: (courseId: string, lessonId: string): StaticLesson | null => {
    const course = StaticContentService.getCourseContent(courseId);
    if (!course) {
      console.error(`No se pudo obtener la lección porque el curso ${courseId} no existe`);
      return null;
    }

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === lessonId) {
          return lesson;
        }
      }
    }

    console.error(`Lección ${lessonId} no encontrada en curso ${courseId}`);
    return null;
  },

  /**
   * Obtiene todas las lecciones de una sección
   * @param courseId ID del curso
   * @param sectionId ID de la sección
   * @returns Lista de lecciones o array vacío si la sección no existe
   */
  getSectionLessons: (courseId: string, sectionId: string): StaticLesson[] => {
    const course = StaticContentService.getCourseContent(courseId);
    if (!course) return [];

    const section = course.sections.find(s => s.id === sectionId);
    return section ? section.lessons : [];
  },

  /**
   * Obtiene todas las secciones de un curso
   * @param courseId ID del curso
   * @returns Lista de secciones o array vacío si el curso no existe
   */
  getCourseSections: (courseId: string): StaticSection[] => {
    const course = StaticContentService.getCourseContent(courseId);
    return course ? course.sections : [];
  },

  /**
   * Obtiene lista de todos los cursos disponibles
   * @returns Lista de cursos estáticos disponibles
   */
  getAllCourses: (): { id: string; title: string }[] => {
    return Object.values(courseContentMap).map(course => ({
      id: course.id,
      title: course.title
    }));
  }
};
