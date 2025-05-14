FROM ubuntu:22.04

# Instala servicios criptográficos
RUN apt update && apt install -y \
    openssl \
    python3 \
    python3-pip \
    && pip3 install pycryptodome==3.9.8

# Crea usuario y directorios
RUN useradd -m -s /bin/bash cryptouser && \
    mkdir -p /opt/crypto/{keys,server} && \
    chown -R cryptouser /opt/crypto

# Copia archivos
COPY vulnerable-files/server.py /opt/crypto/server/
COPY generate-flags.sh /generate-flags.sh
COPY start.sh /start.sh

# Configura vulnerabilidad
RUN echo "cryptouser ALL=(ALL) NOPASSWD: /usr/bin/python3" >> /etc/sudoers && \
    chmod 4755 /usr/bin/python3

EXPOSE 8000
CMD ["/bin/bash", "-c", "/generate-flags.sh && /start.sh"]