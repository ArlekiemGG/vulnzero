
#!/bin/bash

# Función para verificar si un servicio está activo
check_service() {
  if systemctl is-active --quiet $1; then
    echo "[+] $2 está activo"
  else
    echo "[-] $2 no está activo. Intentando iniciar..."
    systemctl start $1 || echo "    [-] Error al iniciar $2"
  fi
}

# Inicia MySQL
echo "[+] Iniciando MySQL..."
service mysql start || echo "[-] MySQL failed to start, continuing..."
sleep 2
check_service mysql "MySQL"

# Inicia Apache en segundo plano
echo "[+] Iniciando Apache..."
/usr/sbin/apache2ctl start || echo "[-] Apache failed to start, continuing..."
sleep 2
if pgrep -f apache2 > /dev/null; then
    echo "[+] Apache iniciado correctamente"
else
    echo "[-] Error al iniciar Apache"
fi

# Inicia Flask con mayor tolerancia a fallos
echo "[+] Iniciando backend Flask..."
cd /backend-maquinas

# Verificar que el directorio existe
if [ ! -d "/backend-maquinas" ]; then
    echo "[-] Error: Directorio /backend-maquinas no encontrado"
    exit 1
fi

# Instalar dependencias
echo "[+] Instalando dependencias..."
python3 -m pip install -r requirements.txt || echo "[-] Failed to install requirements, continuing..."

# Verificar que app.py existe
if [ ! -f "/backend-maquinas/app.py" ]; then
    echo "[-] Error: /backend-maquinas/app.py no encontrado"
    exit 1
fi

# Iniciar aplicación Flask
echo "[+] Lanzando aplicación Flask..."
python3 /backend-maquinas/app.py &  # El '&' es clave para que corra en segundo plano
sleep 3

# Verificar que Flask está corriendo
if pgrep -f "python3 /backend-maquinas/app.py" > /dev/null; then
    echo "[+] Backend Flask iniciado correctamente"
else
    echo "[-] Error al iniciar Flask"
fi

# Mostrar puertos en uso
echo "[+] Puertos en uso:"
netstat -tulpn | grep LISTEN || echo "[-] No se pudo obtener información de puertos"

# Mantén el contenedor activo
echo "[+] Contenedor backend activo y en ejecución"
tail -f /dev/null
