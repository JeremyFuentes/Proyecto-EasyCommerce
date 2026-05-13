# Imagen base solicitada
FROM node:24-bookworm-slim

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (mejora cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto (ajústalo si usas otro)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]