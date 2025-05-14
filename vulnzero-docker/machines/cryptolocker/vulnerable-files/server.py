from Crypto.Cipher import AES
import socket

key = b"VULNERABLEKEY123"
cipher = AES.new(key, AES.MODE_ECB)

def handle_client(conn):
    conn.send(b"Send text to encrypt...
")
    data = conn.recv(1024).strip()
    encrypted = cipher.encrypt(data.ljust(16))
    conn.send(encrypted + b"
")

server = socket.socket()
server.bind(("0.0.0.0", 8000))
server.listen(5)
print("Server running on port 8000...")
while True:
    conn, addr = server.accept()
    handle_client(conn)
