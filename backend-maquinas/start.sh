
#!/bin/bash
service mysql start
# Instalar flask-cors si no está instalado
pip install flask-cors

# Iniciar Apache en segundo plano
/usr/sbin/apache2ctl -D FOREGROUND
