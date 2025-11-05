#!/bin/sh

# Limpiar el directorio dist de manera segura
if [ -d "/usr/src/app/dist" ]; then
    echo "Limpiando directorio dist..."
    find /usr/src/app/dist -mindepth 1 -delete 2>/dev/null || true
fi

# Ejecutar el comando original
exec "$@"
