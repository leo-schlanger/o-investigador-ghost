#!/bin/bash

# =============================================================================
# VPS Initial Setup Script for O Investigador
# Server: srv.jornalinvestigador.pt
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

echo "=============================================="
echo "  O Investigador - VPS Setup"
echo "  Server: srv.jornalinvestigador.pt"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# 1. System Update
# -----------------------------------------------------------------------------
log_step "1/8 - Updating system packages..."
apt update && apt upgrade -y

# -----------------------------------------------------------------------------
# 2. Install Docker
# -----------------------------------------------------------------------------
log_step "2/8 - Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    log_info "Docker installed successfully!"
else
    log_info "Docker already installed."
fi

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# -----------------------------------------------------------------------------
# 3. Install additional tools
# -----------------------------------------------------------------------------
log_step "3/8 - Installing additional tools..."
apt install -y git curl wget certbot python3-certbot-nginx ufw fail2ban

# -----------------------------------------------------------------------------
# 4. Configure Firewall
# -----------------------------------------------------------------------------
log_step "4/8 - Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log_info "Firewall configured: SSH, HTTP, HTTPS allowed"

# -----------------------------------------------------------------------------
# 5. Configure Fail2Ban
# -----------------------------------------------------------------------------
log_step "5/8 - Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log_info "Fail2Ban configured"

# -----------------------------------------------------------------------------
# 6. Create project directory and clone repo
# -----------------------------------------------------------------------------
log_step "6/8 - Setting up project directory..."
PROJECT_DIR="/opt/o-investigador"

if [ -d "$PROJECT_DIR" ]; then
    log_info "Project directory exists. Pulling latest..."
    cd $PROJECT_DIR
    git pull origin main
else
    log_info "Cloning repository..."
    cd /opt
    # If repo is private, user needs to configure SSH keys first
    read -p "Enter Git repository URL: " REPO_URL
    git clone "$REPO_URL" o-investigador
fi

cd $PROJECT_DIR

# Make scripts executable
chmod +x infrastructure/scripts/*.sh

# -----------------------------------------------------------------------------
# 7. Create .env file
# -----------------------------------------------------------------------------
log_step "7/8 - Configuring environment..."

if [ ! -f ".env" ]; then
    cp .env.example .env

    # Generate secure passwords
    DB_ROOT_PASS=$(openssl rand -base64 24 | tr -d '=/+' | cut -c1-32)
    DB_PASS=$(openssl rand -base64 24 | tr -d '=/+' | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d '=/+' | cut -c1-64)

    # Update .env with production values
    sed -i "s|NODE_ENV=development|NODE_ENV=production|g" .env
    sed -i "s|DB_ROOT_PASSWORD=.*|DB_ROOT_PASSWORD=$DB_ROOT_PASS|g" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|g" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i "s|GHOST_URL=.*|GHOST_URL=https://jornalinvestigador.pt|g" .env
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://jornalinvestigador.pt,https://admin.jornalinvestigador.pt|g" .env
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://api.jornalinvestigador.pt|g" .env
    sed -i "s|VITE_GHOST_URL=.*|VITE_GHOST_URL=https://jornalinvestigador.pt|g" .env
    sed -i "s|GHOST_MAIL_FROM=.*|GHOST_MAIL_FROM=noreply@jornalinvestigador.pt|g" .env

    log_info ".env file created with secure passwords"
    log_warn "IMPORTANT: Edit .env to add your API keys (SENDGRID, AWS, GHOST_API_KEY)"
    echo ""
    echo "Generated credentials (SAVE THESE!):"
    echo "  DB_ROOT_PASSWORD: $DB_ROOT_PASS"
    echo "  DB_PASSWORD: $DB_PASS"
    echo ""
else
    log_info ".env file already exists"
fi

# -----------------------------------------------------------------------------
# 8. Create certbot directory
# -----------------------------------------------------------------------------
mkdir -p /var/www/certbot

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
log_info "Next steps:"
echo ""
echo "  1. Edit .env file with your API keys:"
echo "     nano $PROJECT_DIR/.env"
echo ""
echo "  2. Start services (initial - without SSL):"
echo "     cd $PROJECT_DIR"
echo "     # Use initial nginx config first"
echo "     cp infrastructure/nginx/nginx-initial.conf infrastructure/nginx/nginx-prod.conf.bak"
echo "     cp infrastructure/nginx/nginx-initial.conf infrastructure/nginx/nginx-temp.conf"
echo "     sed -i 's|nginx-prod.conf|nginx-temp.conf|g' docker-compose.prod.yml"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "  3. Generate SSL certificates:"
echo "     certbot certonly --webroot -w /var/www/certbot \\"
echo "       -d jornalinvestigador.pt \\"
echo "       -d www.jornalinvestigador.pt \\"
echo "       -d api.jornalinvestigador.pt \\"
echo "       -d admin.jornalinvestigador.pt \\"
echo "       -d ghost.jornalinvestigador.pt"
echo ""
echo "  4. Switch to production nginx config:"
echo "     sed -i 's|nginx-temp.conf|nginx-prod.conf|g' docker-compose.prod.yml"
echo "     docker compose -f docker-compose.prod.yml restart nginx"
echo ""
echo "  5. Setup auto-renewal for SSL:"
echo "     echo '0 3 * * * certbot renew --quiet && docker compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx' | crontab -"
echo ""
echo "=============================================="
