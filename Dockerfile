# Dockerfile para Clinical Dashboard App
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instala PNPM globalmente
RUN npm install -g pnpm@10.6.5

# Instala dependencias del proyecto
RUN pnpm install --frozen-lockfile

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN pnpm build

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["pnpm", "start"]
