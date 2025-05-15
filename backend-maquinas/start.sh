
#!/bin/bash

# Inicia MySQL
service mysql start || echo "MySQL failed to start, continuing..."

# Inicia Apache en segundo plano
/usr/sbin/apache2ctl start || echo "Apache failed to start, continuing..."

# Inicia Flask con mayor tolerancia a fallos
cd /backend-maquinas
python3 -m pip install -r requirements.txt || echo "Failed to install requirements, continuing..."
python3 /backend-maquinas/app.py &  # El '&' es clave para que corra en segundo plano

# Mantén el contenedor activo
tail -f /dev/null
