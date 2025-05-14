#!/bin/bash
python3 /opt/crypto/server/server.py &
tail -f /dev/null
