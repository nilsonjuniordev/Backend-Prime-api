# Dockerfile para o backend (Node.js)
# Stage de construção
FROM node:latest AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

# Estágio final
FROM node:latest AS backend-runtime

WORKDIR /app/backend
COPY --from=backend-builder /app/backend .
RUN npm install --only=production

EXPOSE 8800
CMD ["node", "server.js"]
