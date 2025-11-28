# Etapa 1: Build da aplicação
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY . .

RUN npm install
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Apagar conteúdo padrão
RUN rm -rf /usr/share/nginx/html/*

# Configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4000

CMD ["nginx", "-g", "daemon off;"]
