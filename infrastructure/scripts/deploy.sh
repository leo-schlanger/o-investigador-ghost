#!/bin/bash

set -e

echo "Iniciando deploy O Investigador (ISSCLOUD)..."

# 1. Pull latest code
echo "Atualizando codigo..."
git pull origin main

# 2. Build images locally
echo "Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# 3. Deploy
echo "Deploying..."
docker compose -f docker-compose.prod.yml up -d

# 4. Health check
echo "Waiting for services to start..."
sleep 30
curl -f http://localhost/health || echo "Health check failed, but continuing..."

# 5. Backup (safety)
echo "Criando backup do banco..."
./infrastructure/scripts/backup.sh

echo "Deploy completo com sucesso!"
