FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000

# --- Development ---
FROM base AS development

CMD ["npm", "run", "dev"]

# --- Production ---
FROM base AS production

ENV NODE_ENV=production

CMD ["node", "server.js"]
