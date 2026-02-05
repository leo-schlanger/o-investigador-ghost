FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# --- Development ---
FROM base AS development

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# --- Production ---
FROM base AS build

ARG VITE_API_URL
ARG VITE_GHOST_URL
ARG VITE_ENV

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GHOST_URL=$VITE_GHOST_URL
ENV VITE_ENV=$VITE_ENV

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: route all requests to index.html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
