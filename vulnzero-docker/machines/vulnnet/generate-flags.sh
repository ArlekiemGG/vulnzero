#!/bin/bash
# Genera flags aleatorias al iniciar
echo "FLAG_USUARIO=VulnNet{$(openssl rand -hex 6)}" > /home/vulnuser/user-flag.txt
echo "FLAG_ROOT=VulnNet{$(openssl rand -hex 8)}" > /root/root-flag.txt
chmod 400 /home/vulnuser/user-flag.txt /root/root-flag.txt
chown vulnuser:vulnuser /home/vulnuser/user-flag.txt