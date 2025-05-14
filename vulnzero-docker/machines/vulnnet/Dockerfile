FROM ubuntu:22.04

# Configuración básica
RUN apt update && apt install -y \
    apache2 \
    vsftpd \
    openssh-server \
    sudo

# Crea usuario vulnerable
RUN useradd -m -s /bin/bash vulnuser && \
    echo "vulnuser:password123" | chpasswd && \
    usermod -aG sudo vulnuser

# Copia scripts
COPY generate-flags.sh /generate-flags.sh
COPY vulnerable-files /var/www/html
COPY start.sh /start.sh

# Permisos
RUN chmod +x /generate-flags.sh /start.sh && \
    chown -R vulnuser:vulnuser /var/www/html

# Vulnerabilidad deliberada (permite escalar a root)
RUN echo "vulnuser ALL=(ALL) NOPASSWD: /bin/bash" >> /etc/sudoers && \
    chmod +s /bin/bash

EXPOSE 80 21 22
CMD ["/bin/bash", "-c", "/generate-flags.sh && /start.sh"]
