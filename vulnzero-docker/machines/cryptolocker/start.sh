
#!/bin/bash

# Iniciar el servidor Python en segundo plano
echo "[+] Iniciando servidor Python..."
python3 /opt/crypto/server/server.py &

# Verificar que el servidor se haya iniciado correctamente
sleep 2
if pgrep -f "server.py" > /dev/null; then
    echo "[+] Servidor Python iniciado correctamente"
else
    echo "[-] Error al iniciar el servidor Python"
fi

# Mantener el contenedor activo
echo "[+] Contenedor listo y en ejecución"
tail -f /dev/null
