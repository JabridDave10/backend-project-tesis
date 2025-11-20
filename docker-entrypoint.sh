#!/bin/sh

# Limpiar el directorio dist de manera segura
if [ -d "/usr/src/app/dist" ]; then
    echo "Limpiando directorio dist..."
    find /usr/src/app/dist -mindepth 1 -delete 2>/dev/null || true
fi

# Esperar a que PostgreSQL esté listo (si está configurado)
if [ -n "$DB_HOST" ]; then
    echo "Esperando a que la base de datos esté lista..."
    until nc -z "$DB_HOST" "${DB_PORT:-5432}" 2>/dev/null; do
        echo "Esperando conexión a $DB_HOST:${DB_PORT:-5432}..."
        sleep 2
    done
    echo "Base de datos lista!"
fi

# Ejecutar el comando original
exec "$@"
