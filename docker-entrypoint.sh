#!/bin/sh

# Limpiar el directorio dist solo en desarrollo (en prod ya está compilado)
if [ "$NODE_ENV" != "production" ] && [ -d "/usr/src/app/dist" ]; then
    echo "Limpiando directorio dist..."
    find /usr/src/app/dist -mindepth 1 -delete 2>/dev/null || true
fi

# Esperar a que PostgreSQL esté listo (solo para conexiones locales/Docker)
# Las DBs en la nube (Neon, Supabase) no necesitan esta verificación
if [ -n "$DB_HOST" ] && [ "$NODE_ENV" != "production" ]; then
    echo "Esperando a que la base de datos esté lista..."
    until nc -z "$DB_HOST" "${DB_PORT:-5432}" 2>/dev/null; do
        echo "Esperando conexión a $DB_HOST:${DB_PORT:-5432}..."
        sleep 2
    done
    echo "Base de datos lista!"
fi

# Ejecutar el comando original
exec "$@"
