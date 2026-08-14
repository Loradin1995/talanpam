# Etap 1 — bati fichye estatik yo ak Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# VITE_API_URL rete "/api" pa defo — nginx.conf redireksyone /api/* bay backend la,
# donk pa gen bezwen konfigire yon URL absoli separe pou pwodiksyon.
RUN npm run build

# Etap 2 — sèvi fichye estatik yo ak Nginx + pwoksi API
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx:alpine trete otomatikman *.template ki nan /etc/nginx/templates/ ak
# envsubst anvan li demare (ranplase ${BACKEND_INTERNAL_HOST} pa vrè valè a).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
