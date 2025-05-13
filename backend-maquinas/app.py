
from flask import Flask, request, jsonify
import docker
import uuid
import time
import random
import os
from flask_cors import CORS

# Asegurar el uso del socket Docker correcto si es necesario (Docker Desktop en macOS suele funcionar sin esta línea)
# os.environ["DOCKER_HOST"] = "unix:///Users/zephius/.docker/run/docker.sock"

app = Flask(__name__)
# Habilitar CORS para todas las rutas
CORS(app, resources={r"/api/*": {"origins": ["https://vulnzero.es", "https://www.vulnzero.es"]}})

client = docker.from_env()
sesiones_activas = {}

# Diccionario con los tipos de máquinas disponibles
# Puedes añadir más fácilmente aquí, usando tus imágenes en Docker Hub
imagenes_disponibles = {
    "01": "zephius/vulnnet"
}

def generar_password():
    return uuid.uuid4().hex[:10]

def obtener_puerto_disponible():
    return random.randint(20000, 40000)

@app.route('/api/maquinas/solicitar', methods=['POST'])
def solicitar_maquina():
    datos = request.json
    tipo_maquina = datos['tipoMaquinaId']
    usuario_id = datos['usuarioId']

    if len(sesiones_activas) >= 5:
        return jsonify({"exito": False, "mensaje": "No hay recursos disponibles"})

    imagen_docker = imagenes_disponibles.get(tipo_maquina)
    if not imagen_docker:
        return jsonify({"exito": False, "mensaje": "Tipo de máquina no válido"})

    puerto = obtener_puerto_disponible()

    try:
        contenedor = client.containers.run(
            imagen_docker,
            detach=True,
            ports={'22/tcp': puerto}
        )
    except docker.errors.ImageNotFound:
        return jsonify({"exito": False, "mensaje": "Imagen Docker no encontrada"})
    except Exception as e:
        return jsonify({"exito": False, "mensaje": str(e)})

    sesion_id = str(uuid.uuid4())
    sesiones_activas[sesion_id] = {
        'contenedor_id': contenedor.id,
        'usuario_id': usuario_id,
        'inicio': time.time(),
        'duracion_max': 7200
    }

    return jsonify({
        "exito": True,
        "sesionId": sesion_id,
        "ipAcceso": "api.vulnzero.es",  # Actualizado para producción
        "puertoSSH": puerto,
        "credenciales": {"usuario": "hacker", "password": generar_password()},
        "tiempoLimite": 7200
    })

@app.route('/api/maquinas/liberar', methods=['POST'])
def liberar_maquina():
    datos = request.json
    sesion_id = datos['sesionId']
    sesion = sesiones_activas.get(sesion_id)

    if not sesion:
        return jsonify({"exito": False, "mensaje": "Sesión no encontrada"})

    try:
        contenedor = client.containers.get(sesion['contenedor_id'])
        contenedor.stop()
        contenedor.remove()
    except Exception as e:
        return jsonify({"exito": False, "mensaje": f"Error al liberar contenedor: {e}"})

    del sesiones_activas[sesion_id]

    return jsonify({"exito": True})

@app.route('/api/maquinas/estado', methods=['GET'])
def estado_maquina():
    sesion_id = request.args.get('sesionId')
    sesion = sesiones_activas.get(sesion_id)

    if not sesion:
        return jsonify({"activa": False})

    restante = max(0, sesion['duracion_max'] - (time.time() - sesion['inicio']))
    return jsonify({"activa": True, "tiempoRestante": int(restante)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
