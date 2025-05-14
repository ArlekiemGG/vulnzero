#!/bin/bash
# Flags ocultas en rutas no obvias
echo "FLAG_USUARIO=CryptoLocker{$(openssl rand -hex 5)}" > /opt/crypto/.hidden-user
echo "FLAG_ROOT=CryptoLocker{$(openssl rand -hex 10)}" > /etc/.shadow-root
chmod 400 /opt/crypto/.hidden-user /etc/.shadow-root
chown cryptouser /opt/crypto/.hidden-user