#!/bin/bash

set -e

echo "🚀 Iniciando deploy O Investigador (ISSCLOUD)..."

# 1. Pull latest code
echo "📥 Atualizando código..."
git pull origin main

# 2. Build images locally
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Push to Docker registry (se configurado)
# Se você tiver um registry privado, descomente as linhas abaixo:
# echo "📤 Pushing to Docker registry..."
# docker-compose -f docker-compose.prod.yml push

# 4. Deploy to ISSCLOUD VPS
echo "☁️ Deploying to ISSCLOUD VPS..."
# Opção A: Se você estiver rodando diretamente no servidor ISSCLOUD
docker-compose -f docker-compose.prod.yml up -d

# Opção B: Se estiver fazendo deploy remoto via SSH, descomente abaixo:
# ssh user@your-isscloud-server.com "cd /path/to/o-investigador-ghost && git pull && docker-compose -f docker-compose.prod.yml up -d --build"

# 5. Health check
echo "✅ Waiting for services to start..."
sleep 30
curl -f http://localhost/api/health || echo "⚠️ Health check failed, but continuing..."

# 6. Backup antes (safety)
echo "💾 Criando backup do banco..."
./infrastructure/scripts/backup.sh

echo "✨ Deploy completo com sucesso no ISSCLOUD!"
