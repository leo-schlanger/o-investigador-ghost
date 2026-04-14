#!/bin/bash
# Database Restore Script for O Investigador
# Usage: ./restore.sh <backup_file.sql.gz>

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
CONTAINER_NAME="o-investigador-mysql-1"

# Load environment
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Validate arguments
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <backup_file.sql.gz>${NC}"
    echo ""
    echo "Available backups:"
    ls -lh "$PROJECT_DIR/backups/"*.sql.gz 2>/dev/null || echo "  No backups found in $PROJECT_DIR/backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Validate DB credentials
if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo -e "${RED}Error: DB_PASSWORD and DB_NAME must be set in .env${NC}"
    exit 1
fi

# Confirm with user
echo -e "${YELLOW}=== DATABASE RESTORE ===${NC}"
echo -e "File: ${GREEN}$BACKUP_FILE${NC}"
echo -e "Database: ${GREEN}$DB_NAME${NC}"
echo -e "${RED}WARNING: This will REPLACE all data in the database!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo -e "${YELLOW}[1/4] Stopping dependent services...${NC}"
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml stop api ghost 2>/dev/null || true

echo -e "${YELLOW}[2/4] Checking MySQL container...${NC}"
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: MySQL container not running${NC}"
    echo "Start it with: docker compose -f docker-compose.prod.yml up -d mysql"
    exit 1
fi

echo -e "${YELLOW}[3/4] Restoring database from backup...${NC}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" mysql -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME"
else
    docker exec -i "$CONTAINER_NAME" mysql -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" < "$BACKUP_FILE"
fi

echo -e "${YELLOW}[4/4] Restarting services...${NC}"
docker compose -f docker-compose.prod.yml up -d api ghost

# Wait for services
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Health check
API_STATUS=$(docker compose -f docker-compose.prod.yml exec -T api wget -qO- http://localhost:3000/health 2>/dev/null || echo "failed")
if echo "$API_STATUS" | grep -q "ok"; then
    echo -e "${GREEN}API: OK${NC}"
else
    echo -e "${RED}API: Not responding (may still be starting)${NC}"
fi

echo -e "${GREEN}=== Restore complete ===${NC}"
echo -e "Backup restored: $BACKUP_FILE"
echo -e "Timestamp: $(date)"
