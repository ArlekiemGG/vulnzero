
from flask import Flask, request, jsonify
import docker
import uuid
import time
import random
import os
from flask_cors import CORS

app = Flask(__name__)
# Habilitar CORS para todas las rutas
CORS(app, resources={r"/api/*": {"origins": ["https://vulnzero.es", "https://www.vulnzero.es", "https://locviruzkdfnhusfquuc.lovableproject.com", "http://localhost:*"]}})

# Inicializar el cliente Docker
try:
    client = docker.from_env()
except Exception as e:
    print(f"Error al inicializar Docker: {e}")
    client = None

# Registro de sesiones activas
sesiones_activas = {}

# Diccionario con los tipos de máquinas disponibles y sus configuraciones
imagenes_disponibles = {
    "01": {
        "image": "zephius/vulnnet:latest",
        "ports": {"22/tcp": None, "80/tcp": None},
        "name": "VulnNet",
        "servicios": [
            {"nombre": "ssh", "puerto": 22, "estado": "open", "version": "OpenSSH 7.6p1 Ubuntu 4ubuntu0.3"},
            {"nombre": "http", "puerto": 80, "estado": "open", "version": "Apache httpd 2.4.29"}
        ],
        "vulnerabilidades": [
            {
                "nombre": "Remote Code Execution in File Upload",
                "severidad": "alta",
                "descripcion": "La aplicación web permite subir archivos sin validación adecuada",
                "cve": "CVE-2021-12345"
            }
        ]
    },
    "02": {
        "image": "zephius/laborinet:latest",
        "ports": {"22/tcp": None, "80/tcp": None, "3306/tcp": None},
        "name": "LaBorInet",
        "servicios": [
            {"nombre": "ssh", "puerto": 22, "estado": "open", "version": "OpenSSH 8.2p1 Ubuntu"},
            {"nombre": "http", "puerto": 80, "estado": "open", "version": "nginx 1.18.0"},
            {"nombre": "mysql", "puerto": 3306, "estado": "open", "version": "MySQL 5.7.33"}
        ],
        "vulnerabilidades": [
            {
                "nombre": "SQL Injection",
                "severidad": "alta",
                "descripcion": "Aplicación web vulnerable a SQL injection en parámetros de login",
                "cve": "CVE-2022-45678"
            }
        ]
    }
}

# Flags para validación
flags = {
    "01": {
        "user": os.environ.get('VULNNET_USER_FLAG', 'flag{user_b457c83d29a961609a529a539}'),
        "root": os.environ.get('VULNNET_ROOT_FLAG', 'flag{root_7d89c01a53e7f956340a4d83}')
    },
    "02": {
        "user": os.environ.get('LABORINET_USER_FLAG', 'flag{user_a8b72cd44e9152f37dac8e74}'),
        "root": os.environ.get('LABORINET_ROOT_FLAG', 'flag{root_f9e78d2c4a153b68e902d7a5}')
    }
}

def generar_password():
    """Genera una contraseña aleatoria para la máquina"""
    return uuid.uuid4().hex[:10]

def obtener_puerto_disponible():
    """Obtiene un puerto libre para mapear en el host"""
    # En producción, esto debería verificar si el puerto está en uso
    return random.randint(20000, 40000)

def limpiar_sesiones_expiradas():
    """Elimina sesiones expiradas y detiene sus contenedores"""
    tiempo_actual = time.time()
    sesiones_a_eliminar = []
    
    for sesion_id, datos in sesiones_activas.items():
        if datos['inicio'] + datos['duracion_max'] < tiempo_actual:
            try:
                if client:
                    contenedor = client.containers.get(datos['contenedor_id'])
                    contenedor.stop()
                    contenedor.remove()
                sesiones_a_eliminar.append(sesion_id)
            except Exception as e:
                print(f"Error al limpiar sesión {sesion_id}: {e}")
    
    for sesion_id in sesiones_a_eliminar:
        del sesiones_activas[sesion_id]

@app.route('/api/maquinas/solicitar', methods=['POST'])
def solicitar_maquina():
    """Endpoint para solicitar una nueva máquina virtual"""
    datos = request.json
    tipo_maquina = datos['tipoMaquinaId']
    usuario_id = datos['usuarioId']
    
    # Verificar si hay demasiadas sesiones activas
    if len(sesiones_activas) >= 10:  # Límite ajustable según recursos
        return jsonify({"exito": False, "mensaje": "No hay recursos disponibles"})
    
    # Verificar tipo de máquina
    if tipo_maquina not in imagenes_disponibles:
        return jsonify({"exito": False, "mensaje": "Tipo de máquina no válido"})
    
    config_maquina = imagenes_disponibles[tipo_maquina]
    password = generar_password()
    
    # Crear puertos para la máquina
    port_bindings = {}
    exposed_ports = {}
    for port in config_maquina["ports"]:
        host_port = obtener_puerto_disponible()
        port_bindings[port] = host_port
        exposed_ports[port] = {'HostPort': str(host_port)}

    try:
        # Intentar crear contenedor real si Docker está disponible
        if client:
            contenedor = client.containers.run(
                config_maquina["image"],
                detach=True,
                ports=exposed_ports,
                environment={
                    "USER_FLAG": flags[tipo_maquina]["user"],
                    "ROOT_FLAG": flags[tipo_maquina]["root"],
                    "USER_PASSWORD": password
                },
                name=f"vulnzero-{usuario_id}-{uuid.uuid4().hex[:8]}"
            )
            contenedor_id = contenedor.id
            ip_acceso = "localhost"  # O la IP pública del servidor
        else:
            # Simulación para entornos sin Docker
            contenedor_id = f"simulado-{uuid.uuid4().hex[:8]}"
            ip_acceso = "10.10.10." + str(random.randint(1, 254))
            
        # Registrar sesión
        sesion_id = str(uuid.uuid4())
        tiempo_limite = 7200  # 2 horas por defecto
        puerto_ssh = port_bindings.get("22/tcp", obtener_puerto_disponible())
        
        sesiones_activas[sesion_id] = {
            'contenedor_id': contenedor_id,
            'usuario_id': usuario_id,
            'tipo_maquina': tipo_maquina,  # Guardamos para referencia de servicios/vulnerabilidades
            'inicio': time.time(),
            'duracion_max': tiempo_limite,
            'puerto_ssh': puerto_ssh,
            'ip_acceso': ip_acceso
        }
        
        return jsonify({
            "exito": True,
            "sesionId": sesion_id,
            "ipAcceso": ip_acceso,
            "puertoSSH": puerto_ssh,
            "credenciales": {"usuario": "hacker", "password": password},
            "tiempoLimite": tiempo_limite,
            "mensaje": "Máquina creada correctamente"
        })
        
    except Exception as e:
        print(f"Error al crear máquina: {e}")
        return jsonify({"exito": False, "mensaje": f"Error al crear máquina: {str(e)}"})

@app.route('/api/maquinas/liberar', methods=['POST'])
def liberar_maquina():
    """Endpoint para liberar una máquina virtual"""
    datos = request.json
    sesion_id = datos['sesionId']
    
    if sesion_id not in sesiones_activas:
        return jsonify({"exito": False, "mensaje": "Sesión no encontrada"})
    
    try:
        # Detener y eliminar el contenedor real si Docker está disponible
        if client:
            try:
                contenedor = client.containers.get(sesiones_activas[sesion_id]['contenedor_id'])
                contenedor.stop()
                contenedor.remove()
            except docker.errors.NotFound:
                # El contenedor ya no existe, lo cual es aceptable
                pass
            except Exception as e:
                print(f"Error al detener contenedor: {e}")
                return jsonify({"exito": False, "mensaje": f"Error al liberar la máquina: {str(e)}"})
                
        # Eliminar sesión
        del sesiones_activas[sesion_id]
        return jsonify({"exito": True, "mensaje": "Máquina liberada correctamente"})
        
    except Exception as e:
        print(f"Error al liberar máquina: {e}")
        return jsonify({"exito": False, "mensaje": f"Error al liberar la máquina: {str(e)}"})

@app.route('/api/maquinas/estado', methods=['GET'])
def estado_maquina():
    """Endpoint para verificar el estado de una máquina virtual"""
    sesion_id = request.args.get('sesionId')
    
    if sesion_id not in sesiones_activas:
        return jsonify({"activa": False, "mensaje": "La sesión ha expirado o no existe"})
    
    sesion = sesiones_activas[sesion_id]
    tiempo_actual = time.time()
    tiempo_restante = max(0, sesion['duracion_max'] - (tiempo_actual - sesion['inicio']))
    
    # Verificar si el contenedor sigue activo
    estado = "running"
    if client:
        try:
            contenedor = client.containers.get(sesion['contenedor_id'])
            estado = contenedor.status
        except Exception as e:
            print(f"Error al verificar estado: {e}")
            estado = "unknown"
    
    # Obtener información sobre servicios y vulnerabilidades
    detalles = {}
    tipo_maquina = sesion.get('tipo_maquina')
    
    if tipo_maquina in imagenes_disponibles:
        config_maquina = imagenes_disponibles[tipo_maquina]
        detalles = {
            "servicios": config_maquina.get("servicios", []),
            "vulnerabilidades": config_maquina.get("vulnerabilidades", [])
        }
    
    return jsonify({
        "activa": tiempo_restante > 0 and estado == "running", 
        "tiempoRestante": int(tiempo_restante),
        "estado": estado,
        "detalles": detalles
    })

@app.route('/api/maquinas/comando', methods=['POST'])
def ejecutar_comando():
    """Endpoint para ejecutar un comando en la máquina"""
    datos = request.json
    sesion_id = datos.get('sessionId')
    comando = datos.get('command')
    
    if not sesion_id or not comando:
        return jsonify({"success": False, "output": "Faltan parámetros obligatorios"})
    
    if sesion_id not in sesiones_activas:
        return jsonify({"success": False, "output": "La sesión no existe o ha expirado"})
    
    sesion = sesiones_activas[sesion_id]
    
    # Aquí normalmente ejecutaríamos el comando via SSH en la máquina real
    # Para la demostración, simulamos salidas realistas para comandos comunes
    
    # Respuestas para comandos comunes
    if comando.startswith('ls'):
        return jsonify({
            "success": True,
            "output": "Desktop\nDocuments\nDownloads\nMusic\nPictures\nPublic\nTemplates\nVideos\nuser.txt"
        })
    elif comando.startswith('cat /etc/passwd'):
        return jsonify({
            "success": True,
            "output": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\nirc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin\ngnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin\nsystemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin\nmessagebus:x:103:106::/nonexistent:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\n_apt:x:105:65534::/nonexistent:/usr/sbin/nologin\ntss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false\nuuidd:x:107:112::/run/uuidd:/usr/sbin/nologin\ntcpdump:x:108:113::/nonexistent:/usr/sbin/nologin\nlandscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin\npollinate:x:110:1::/var/cache/pollinate:/bin/false\nusbmux:x:111:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin\nsshd:x:112:65534::/run/sshd:/usr/sbin/nologin\nsystemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin\nhacker:x:1000:1000:hacker:/home/hacker:/bin/bash\nlxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false\nmysql:x:113:117:MySQL Server,,,:/nonexistent:/bin/false"
        })
    elif comando.startswith('whoami'):
        return jsonify({
            "success": True,
            "output": "hacker"
        })
    elif comando.startswith('id'):
        return jsonify({
            "success": True,
            "output": "uid=1000(hacker) gid=1000(hacker) groups=1000(hacker),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),116(lxd)"
        })
    elif comando.startswith('ps'):
        return jsonify({
            "success": True,
            "output": "  PID TTY          TIME CMD\n 3251 pts/0    00:00:00 bash\n 3293 pts/0    00:00:00 ps\n"
        })
    elif comando.startswith('uname'):
        return jsonify({
            "success": True,
            "output": "Linux vulnzero-machine 5.4.0-144-generic #161-Ubuntu SMP Fri Feb 3 14:49:04 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux"
        })
    elif comando == 'pwd':
        return jsonify({
            "success": True,
            "output": "/home/hacker"
        })
    else:
        # Para comandos desconocidos, devolver mensaje de error realista
        return jsonify({
            "success": True,
            "output": f"bash: {comando.split()[0]}: command not found"
        })

@app.route('/api/flags/validate', methods=['POST'])
def validate_flag():
    """Endpoint para validar flags enviadas por los usuarios"""
    datos = request.json
    machine_id = datos.get('machine')
    flag_value = datos.get('flag')
    level = datos.get('level')
    user_id = datos.get('userId')
    
    # Validar parámetros
    if not all([machine_id, flag_value, level, user_id]):
        return jsonify({"success": False, "error": "Parámetros incompletos"})
    
    if machine_id not in flags:
        return jsonify({"success": False, "error": "Máquina desconocida"})
        
    if level not in ['user', 'root']:
        return jsonify({"success": False, "error": "Nivel de flag inválido"})
    
    # Validar la flag
    expected_flag = flags[machine_id][level]
    is_valid = flag_value == expected_flag
    
    if is_valid:
        # Otorgar puntos según el nivel
        points = 50 if level == 'root' else 20
        return jsonify({
            "success": True,
            "points": points,
            "message": f"¡Flag correcta! Has conseguido {points} puntos."
        })
    else:
        return jsonify({
            "success": False,
            "error": "Flag incorrecta, sigue intentando."
        })

# Ejecutar tarea de limpieza periódicamente
@app.before_request
def before_request():
    # Limpiar sesiones expiradas cada 10 solicitudes (aproximadamente)
    if random.random() < 0.1:
        limpiar_sesiones_expiradas()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
