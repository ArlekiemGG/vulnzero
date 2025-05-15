
#!/bin/bash
set -e

# Directorio base
cd ../machines

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando construcción de máquinas...${NC}"

# Construir todas las máquinas en paralelo para mayor eficiencia
machines=("vulnnet" "cryptolocker")
pids=()

for machine in "${machines[@]}"; do
  echo -e "${GREEN}Construyendo $machine...${NC}"
  docker build -t vulnzero/$machine:1.0 $machine &
  pids+=($!)
done

# Esperar a que terminen todos los procesos
for pid in "${pids[@]}"; do
  wait $pid || { echo "Error en construcción de una máquina"; exit 1; }
done

echo -e "${GREEN}Todas las máquinas construidas correctamente${NC}"
