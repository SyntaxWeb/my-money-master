FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev --foreground-scripts --no-audit --no-fund

COPY . .

ARG VITE_API_BASE_URL=https://api-financeiro.syntaxweb.com.br/api
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

FROM ghcr.io/syntaxweb/php-base:8.3-alpine

WORKDIR /var/www/html

COPY nginx.conf /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /var/www/html/public

EXPOSE 8000
