#!/bin/bash

# =============================================================================
# Rollback Script - Revert to previous deployment
# =============================================================================
# Usage: ./rollback.sh [commit-hash]
#   If no commit hash provided, rolls back to previous commit
# =============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"
APP_SERVICES="ghost api admin nginx"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=============================================="
echo "  O Investigador - Rollback"
echo "  $(date)"
echo "=============================================="

# Get target commit
if [ -n "$1" ]; then
    TARGET_COMMIT="$1"
    log_info "Rolling back to commit: $TARGET_COMMIT"
else
    TARGET_COMMIT="HEAD~1"
    log_info "Rolling back to previous commit"
fi

# Show current and target commit
CURRENT_COMMIT=$(git rev-parse HEAD)
log_info "Current commit: $CURRENT_COMMIT"

# Confirm rollback
echo ""
log_warn "This will rollback the application to: $TARGET_COMMIT"
read -p "Are you sure? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Rollback cancelled."
    exit 0
fi

# -----------------------------------------------------------------------------
# 1. Rollback git
# -----------------------------------------------------------------------------
log_info "Rolling back code..."
git fetch origin
git checkout $TARGET_COMMIT

# -----------------------------------------------------------------------------
# 2. Rebuild and restart services
# -----------------------------------------------------------------------------
log_info "Rebuilding services..."
docker compose -f $COMPOSE_FILE build --no-cache $APP_SERVICES

log_info "Restarting services..."
docker compose -f $COMPOSE_FILE stop $APP_SERVICES
docker compose -f $COMPOSE_FILE rm -f $APP_SERVICES
docker compose -f $COMPOSE_FILE up -d $APP_SERVICES

# -----------------------------------------------------------------------------
# 3. Wait and verify
# -----------------------------------------------------------------------------
log_info "Waiting for services..."
sleep 15

docker compose -f $COMPOSE_FILE ps

echo ""
log_info "Rollback completed!"
log_info "Rolled back from: $CURRENT_COMMIT"
log_info "Now at: $(git rev-parse HEAD)"
echo "=============================================="
