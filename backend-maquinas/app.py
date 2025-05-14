
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

client = docker.from_env()
sesiones_activas = {}

# Diccionario con los tipos de máquinas disponibles
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

    # Simulación para desarrollo - no intenta crear contenedores reales
    # Solo devuelve una respuesta simulada
    sesion_id = str(uuid.uuid4())
    puerto = obtener_puerto_disponible()
    password = generar_password()
    
    # Registrar la sesión en memoria (simulado)
    sesiones_activas[sesion_id] = {
        'contenedor_id': 'simulado-' + sesion_id[:8],
        'usuario_id': usuario_id,
        'inicio': time.time(),
        'duracion_max': 7200
    }

    return jsonify({
        "exito": True,
        "sesionId": sesion_id,
        "ipAcceso": "10.10.10." + str(random.randint(1, 254)),
        "puertoSSH": puerto,
        "credenciales": {"usuario": "hacker", "password": password},
        "tiempoLimite": 7200
    })

@app.route('/api/maquinas/liberar', methods=['POST'])
def liberar_maquina():
    datos = request.json
    sesion_id = datos['sesionId']
    sesion = sesiones_activas.get(sesion_id)

    if not sesion:
        return jsonify({"exito": False, "mensaje": "Sesión no encontrada"})

    # Simulamos liberar el contenedor
    if sesion_id in sesiones_activas:
        del sesiones_activas[sesion_id]

    return jsonify({"exito": True})

@app.route('/api/maquinas/estado', methods=['GET'])
def estado_maquina():
    sesion_id = request.args.get('sesionId')
    sesion = sesiones_activas.get(sesion_id)

    if not sesion:
        return jsonify({"activa": False})

    restante = max(0, sesion['duracion_max'] - (time.time() - sesion['inicio']))
    return jsonify({"activa": True, "tiempoRestante": int(restante), "status": "running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
