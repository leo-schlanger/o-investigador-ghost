#!/bin/bash

# =============================================================================
# Finalize VPS Setup - O Investigador
# Run this script on the VPS after code is already deployed
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_DIR=$(pwd)

echo "=============================================="
echo "  O Investigador - Finalize Setup"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    log_error "docker-compose.prod.yml not found!"
    log_error "Run this script from the project root directory"
    exit 1
fi

# -----------------------------------------------------------------------------
# 1. Install Docker if not present
# -----------------------------------------------------------------------------
log_info "Checking Docker..."
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! docker compose version &> /dev/null; then
    log_info "Installing Docker Compose plugin..."
    apt update && apt install -y docker-compose-plugin
fi

log_info "Docker OK: $(docker --version)"

# -----------------------------------------------------------------------------
# 2. Install certbot
# -----------------------------------------------------------------------------
log_info "Checking Certbot..."
if ! command -v certbot &> /dev/null; then
    apt update && apt install -y certbot
fi
log_info "Certbot OK"

# -----------------------------------------------------------------------------
# 3. Configure .env
# -----------------------------------------------------------------------------
log_info "Configuring environment..."

if [ ! -f ".env" ]; then
    cp .env.example .env

    # Generate secure passwords
    DB_ROOT_PASS=$(openssl rand -base64 24 | tr -d '=/+' | cut -c1-32)
    DB_PASS=$(openssl rand -base64 24 | tr -d '=/+' | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d '=/+' | cut -c1-64)

    # Update .env
    sed -i "s|NODE_ENV=development|NODE_ENV=production|g" .env
    sed -i "s|DB_ROOT_PASSWORD=.*|DB_ROOT_PASSWORD=$DB_ROOT_PASS|g" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|g" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i "s|GHOST_URL=.*|GHOST_URL=https://jornalinvestigador.pt|g" .env
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://jornalinvestigador.pt,https://admin.jornalinvestigador.pt|g" .env
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://api.jornalinvestigador.pt|g" .env
    sed -i "s|VITE_GHOST_URL=.*|VITE_GHOST_URL=https://jornalinvestigador.pt|g" .env
    sed -i "s|GHOST_MAIL_FROM=.*|GHOST_MAIL_FROM=noreply@jornalinvestigador.pt|g" .env

    echo ""
    echo "=============================================="
    echo "  SAVE THESE CREDENTIALS!"
    echo "=============================================="
    echo "  DB_ROOT_PASSWORD: $DB_ROOT_PASS"
    echo "  DB_PASSWORD: $DB_PASS"
    echo "  JWT_SECRET: $JWT_SECRET"
    echo "=============================================="
    echo ""
else
    log_info ".env already exists"
fi

# -----------------------------------------------------------------------------
# 4. Create certbot directory
# -----------------------------------------------------------------------------
mkdir -p /var/www/certbot

# -----------------------------------------------------------------------------
# 5. Make scripts executable
# -----------------------------------------------------------------------------
chmod +x infrastructure/scripts/*.sh 2>/dev/null || true

# -----------------------------------------------------------------------------
# 6. Start services with initial config (HTTP only for SSL setup)
# -----------------------------------------------------------------------------
log_info "Preparing for SSL certificate generation..."

# Backup original nginx config
cp infrastructure/nginx/nginx-prod.conf infrastructure/nginx/nginx-prod.conf.ssl

# Use initial config for certificate generation
cp infrastructure/nginx/nginx-initial.conf infrastructure/nginx/nginx-prod.conf

# Create docker-compose override for certbot volume
cat > docker-compose.certbot.yml << 'EOF'
services:
  nginx:
    volumes:
      - ./infrastructure/nginx/nginx-prod.conf:/etc/nginx/nginx.conf:ro
      - /var/www/certbot:/var/www/certbot:ro
EOF

log_info "Starting services (HTTP mode)..."
docker compose -f docker-compose.prod.yml -f docker-compose.certbot.yml up -d

# Wait for services
log_info "Waiting for services to start..."
sleep 30

# -----------------------------------------------------------------------------
# 7. Generate SSL Certificates
# -----------------------------------------------------------------------------
echo ""
log_info "Generating SSL certificates..."

certbot certonly --webroot -w /var/www/certbot \
    -d jornalinvestigador.pt \
    -d www.jornalinvestigador.pt \
    -d api.jornalinvestigador.pt \
    -d admin.jornalinvestigador.pt \
    -d ghost.jornalinvestigador.pt \
    --non-interactive \
    --agree-tos \
    --email admin@jornalinvestigador.pt \
    --no-eff-email

if [ $? -eq 0 ]; then
    log_info "SSL certificates generated successfully!"
else
    log_error "SSL certificate generation failed!"
    log_warn "You may need to run certbot manually"
    exit 1
fi

# -----------------------------------------------------------------------------
# 8. Switch to production config with SSL
# -----------------------------------------------------------------------------
log_info "Switching to SSL configuration..."

# Restore SSL nginx config
cp infrastructure/nginx/nginx-prod.conf.ssl infrastructure/nginx/nginx-prod.conf

# Remove certbot override
rm -f docker-compose.certbot.yml

# Restart nginx with SSL
docker compose -f docker-compose.prod.yml restart nginx

log_info "Nginx restarted with SSL"

# -----------------------------------------------------------------------------
# 9. Setup auto-renewal
# -----------------------------------------------------------------------------
log_info "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx") | crontab -

# -----------------------------------------------------------------------------
# 10. Verify
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Verifying Services"
echo "=============================================="

sleep 10

docker compose -f docker-compose.prod.yml ps

echo ""
log_info "Testing endpoints..."
curl -sI https://jornalinvestigador.pt 2>/dev/null | head -1 || echo "Main site: Check manually"
curl -sI https://api.jornalinvestigador.pt/health 2>/dev/null | head -1 || echo "API: Check manually"

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "  URLs:"
echo "    - Site: https://jornalinvestigador.pt"
echo "    - Ghost Admin: https://ghost.jornalinvestigador.pt/ghost"
echo "    - API: https://api.jornalinvestigador.pt"
echo "    - Admin Panel: https://admin.jornalinvestigador.pt"
echo ""
echo "  Next steps:"
echo "    1. Access Ghost admin to complete setup"
echo "    2. Get GHOST_API_KEY from Ghost settings"
echo "    3. Update .env with the API key"
echo "    4. Restart services: docker compose -f docker-compose.prod.yml restart"
echo ""
echo "=============================================="
