# Dockerfile para o backend (Node.js)
# Stage de construção
FROM node:latest AS backend-builder

WORKDIR /app/backend
COPY Backend-Prime-api/package*.json ./
RUN npm install
COPY Backend-Prime-api .

# Estágio final
FROM node:latest AS backend-runtime

# Instalação do Nginx
RUN apt-get update && \
    apt-get install -y nginx


# Copia o arquivo de configuração customizado para o contêiner
COPY Backend-Prime-api/nginx.conf /etc/nginx/conf.d/

WORKDIR /app/backend
COPY --from=backend-builder /app/backend .
RUN npm install --only=production

# Expor a porta 80 para o tráfego HTTP (padrão do Nginx)
EXPOSE 8800

# Iniciar o Nginx e o servidor Node.js
CMD service nginx start && node server.js
