#!/bin/sh

# Detener y eliminar contenedores
docker-compose down --remove-orphans

# Eliminar volúmenes no utilizados
docker volume prune -f

# Eliminar imágenes no utilizadas
docker image prune -f

# Eliminar archivos de construcción de Next.js
rm -rf .next
rm -rf node_modules
rm -rf out

# Instalar dependencias nuevamente
npm install

echo "¡Limpieza completada!"
