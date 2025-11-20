FROM node:20-alpine

# Instalar netcat para verificar conexiones
RUN apk add --no-cache netcat-openbsd

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Copiar y dar permisos al script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    sed -i.bak 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    rm -f /usr/local/bin/docker-entrypoint.sh.bak

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

