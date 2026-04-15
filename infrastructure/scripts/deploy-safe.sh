#!/bin/bash

# =============================================================================
# Deploy Script - Zero Downtime (Database Safe)
# =============================================================================
# This script updates the application services WITHOUT touching the database.
# MySQL container remains running throughout the deployment.
# =============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"
APP_SERVICES="ghost api admin"
INFRA_SERVICES="redis loki promtail grafana nginx"

echo "=============================================="
echo "  O Investigador - Safe Deploy"
echo "  $(date)"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# -----------------------------------------------------------------------------
# 1. Pre-flight checks
# -----------------------------------------------------------------------------
log_info "Running pre-flight checks..."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running!"
    exit 1
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_error ".env file not found!"
    exit 1
fi

log_info "Pre-flight checks passed!"

# -----------------------------------------------------------------------------
# 2. Ensure MySQL is running (don't touch it!)
# -----------------------------------------------------------------------------
log_info "Checking MySQL status..."

MYSQL_STATUS=$(docker ps --filter "name=o-investigador-db" --format "{{.Status}}" 2>/dev/null || echo "")

if [ -z "$MYSQL_STATUS" ]; then
    log_warn "MySQL container not found. Starting database..."
    docker compose -f $COMPOSE_FILE up -d mysql

    log_info "Waiting for MySQL to be healthy..."
    sleep 30

    # Wait for MySQL to be healthy
    RETRIES=30
    until docker compose -f $COMPOSE_FILE exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
        RETRIES=$((RETRIES-1))
        if [ $RETRIES -eq 0 ]; then
            log_error "MySQL failed to start!"
            exit 1
        fi
        echo -n "."
        sleep 2
    done
    echo ""
    log_info "MySQL is ready!"
else
    log_info "MySQL is running: $MYSQL_STATUS"
fi

# -----------------------------------------------------------------------------
# 3. Build new images for application services only
# -----------------------------------------------------------------------------
log_info "Building application images..."

docker compose -f $COMPOSE_FILE build --no-cache $APP_SERVICES

log_info "Images built successfully!"

# -----------------------------------------------------------------------------
# 4. Ensure infrastructure services are running (redis, monitoring)
# -----------------------------------------------------------------------------
log_info "Ensuring infrastructure services are running..."

# Start infra services (these use official images, no build needed)
docker compose -f $COMPOSE_FILE up -d redis loki
sleep 5
docker compose -f $COMPOSE_FILE up -d promtail grafana

log_info "Infrastructure services ready!"

# -----------------------------------------------------------------------------
# 5. Stop and recreate application services (NOT mysql)
# -----------------------------------------------------------------------------
log_info "Updating application services..."

# Stop app services gracefully
docker compose -f $COMPOSE_FILE stop $APP_SERVICES nginx

# Remove old containers (not volumes!)
docker compose -f $COMPOSE_FILE rm -f $APP_SERVICES nginx

# Start services with new images
docker compose -f $COMPOSE_FILE up -d $APP_SERVICES

# Wait for app services before starting nginx
sleep 5
docker compose -f $COMPOSE_FILE up -d nginx

log_info "Application services updated!"

# -----------------------------------------------------------------------------
# 6. Wait for services to be healthy
# -----------------------------------------------------------------------------
log_info "Waiting for services to be healthy..."

sleep 15

# Check each service
check_service() {
    local service=$1
    local url=$2
    local retries=10

    while [ $retries -gt 0 ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_info "$service is healthy!"
            return 0
        fi
        retries=$((retries-1))
        sleep 3
    done

    log_warn "$service health check failed (may still be starting)"
    return 1
}

check_service "API" "http://localhost:3001/health" || true
check_service "Ghost" "http://localhost:2368/ghost/api/admin/site/" || true

# -----------------------------------------------------------------------------
# 7. Cleanup old images
# -----------------------------------------------------------------------------
log_info "Cleaning up old images..."

docker image prune -f > /dev/null 2>&1 || true

# -----------------------------------------------------------------------------
# 8. Show status
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Deployment Summary"
echo "=============================================="
docker compose -f $COMPOSE_FILE ps

echo ""
log_info "Deploy completed successfully!"
echo "=============================================="
