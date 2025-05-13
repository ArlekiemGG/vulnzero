#!/bin/bash

# Inicia MySQL
service mysql start

# Inicia Apache en segundo plano
/usr/sbin/apache2ctl start

# Inicia Flask (¡asegúrate de que app.py esté en /app!)
python3 /app/app.py &  # El '&' es clave para que corra en segundo plano

# Mantén el contenedor activo
tail -f /dev/null