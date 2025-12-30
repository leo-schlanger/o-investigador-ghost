FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Use a non-root user for security
RUN chown -R node:node /app
USER node

CMD ["npm", "run", "dev"]
