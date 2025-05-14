#!/bin/bash
service apache2 start
service vsftpd start
service ssh start
tail -f /dev/null
