FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get upgrade -y

# Instalar paquetes esenciales
RUN apt-get install -y \
    apache2 \
    php \
    mysql-server \
    curl \
    net-tools \
    nmap \
    wget \
    sudo \
    nano \
    git \
    p7zip-full

# Instalar GoBuster (precompilado)
RUN wget https://github.com/OJ/gobuster/releases/download/v3.1.0/gobuster-linux-amd64.7z -O /tmp/gobuster.7z && \
    7z x /tmp/gobuster.7z -o/tmp/ && \
    mv /tmp/gobuster-linux-amd64 /usr/local/bin/gobuster && \
    chmod +x /usr/local/bin/gobuster && \
    rm /tmp/gobuster.7z

# Crear archivos vulnerables
RUN echo "<?php phpinfo(); ?>" > /var/www/html/info.php && \
    echo "<html><body><h1>VulnNet</h1></body></html>" > /var/www/html/index.html && \
    echo "<?php system(\$_GET['cmd']); ?>" > /var/www/html/shell.php && \
    chmod 777 /var/www/html/shell.php

# Crear usuarios débiles y ajustar permisos
RUN useradd -m -s /bin/bash vulnnet && \
    echo 'vulnnet:vulnnet123' | chpasswd && \
    echo 'root:toor' | chpasswd && \
    chmod u+s /bin/find

# Limpiar sistema
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 80 22

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
