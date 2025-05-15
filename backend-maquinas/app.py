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
        "name": "VulnNet"
    }
}

# Flags para validación
flags = {
    "01": {
        "user": os.environ.get('VULNNET_USER_FLAG', 'flag{user_b457c83d29a961609a529a539}'),
        "root": os.environ.get('VULNNET_ROOT_FLAG', 'flag{root_7d89c01a53e7f956340a4d83}')
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
            'inicio': time.time(),
            'duracion_max': tiempo_limite,
            'puerto_ssh': puerto_ssh
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
    
    return jsonify({
        "activa": tiempo_restante > 0 and estado == "running", 
        "tiempoRestante": int(tiempo_restante),
        "status": estado
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
