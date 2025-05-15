
#!/bin/bash

# Iniciar servicios necesarios
echo "[+] Iniciando servicios..."
service apache2 start || echo "[-] Error al iniciar Apache"
service vsftpd start || echo "[-] Error al iniciar FTP"
service ssh start || echo "[-] Error al iniciar SSH"

# Verificar que los servicios se hayan iniciado correctamente
sleep 2
if service apache2 status | grep -q "running"; then
    echo "[+] Apache iniciado correctamente"
fi
if service vsftpd status | grep -q "running"; then
    echo "[+] FTP iniciado correctamente"
fi
if service ssh status | grep -q "running"; then
    echo "[+] SSH iniciado correctamente"
fi

# Mantener el contenedor activo
echo "[+] Contenedor listo y en ejecución"
tail -f /dev/null
