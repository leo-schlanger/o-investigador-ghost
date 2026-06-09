#!/bin/bash

# =============================================================================
# Backup Script - MySQL Database
# =============================================================================
# Creates compressed backups of the MySQL database
# Keeps last 7 days of backups by default
# =============================================================================

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
CONTAINER_NAME="o-investigador-db"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Validate required variables
if [ -z "$DB_PASSWORD" ]; then
    log_error "DB_PASSWORD not set. Please set it in .env or environment."
    exit 1
fi

DB_USER="${DB_USER:-ghost}"
DB_NAME="${DB_NAME:-o_investigador}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log_info "Starting backup..."
log_info "Database: $DB_NAME"
log_info "Backup directory: $BACKUP_DIR"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_error "MySQL container ($CONTAINER_NAME) is not running!"
    exit 1
fi

# Create backup
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

log_info "Creating dump..."
docker exec "$CONTAINER_NAME" mysqldump \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" > "$BACKUP_FILE"

# Compress
log_info "Compressing backup..."
gzip "$BACKUP_FILE"

FINAL_FILE="${BACKUP_FILE}.gz"
FILE_SIZE=$(du -h "$FINAL_FILE" | cut -f1)

log_info "Backup created: $FINAL_FILE ($FILE_SIZE)"

# =============================================================================
# Backup dos volumes de conteudo (media do Ghost + uploads da API)
# Sem isto, um desastre de volume perde permanentemente toda a midia do jornal.
# =============================================================================
BACKUP_DIR_ABS="$(cd "$BACKUP_DIR" && pwd)"

backup_volume() {
    local match="$1"
    local label="$2"
    local vol
    vol=$(docker volume ls --format '{{.Name}}' | grep -E "$match" | head -n1)
    if [ -z "$vol" ]; then
        log_error "Volume '$match' nao encontrado - backup de $label IGNORADO"
        return 0
    fi
    local out_name="${label}_${TIMESTAMP}.tar.gz"
    log_info "Backing up volume $vol ($label)..."
    if docker run --rm -v "$vol":/data:ro -v "$BACKUP_DIR_ABS":/backup alpine \
        tar czf "/backup/$out_name" -C /data . 2>/dev/null; then
        log_info "Volume $label -> $BACKUP_DIR_ABS/$out_name ($(du -h "$BACKUP_DIR_ABS/$out_name" | cut -f1))"
    else
        log_error "Falha no backup do volume $label (continuando)"
    fi
}

backup_volume "ghost_content" "ghost_content"
backup_volume "api_uploads" "api_uploads"

# Upload to S3 (if configured) - DB dump + volumes deste TIMESTAMP
if [ -n "$AWS_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    log_info "Uploading to S3..."
    for f in "$BACKUP_DIR"/db_backup_${TIMESTAMP}.sql.gz "$BACKUP_DIR"/*_${TIMESTAMP}.tar.gz; do
        [ -f "$f" ] || continue
        aws s3 cp "$f" "s3://$AWS_BUCKET/backups/$(basename "$f")" && \
            log_info "Uploaded $(basename "$f")" || \
            log_error "S3 upload failed for $(basename "$f") (local backup preserved)"
    done
fi

# Cleanup old backups (DB + volumes)
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" \( -name "db_backup_*.sql.gz" -o -name "ghost_content_*.tar.gz" -o -name "api_uploads_*.tar.gz" \) -mtime +$RETENTION_DAYS -delete -print | wc -l)
log_info "Deleted $DELETED old backup(s)"

# List current backups
echo ""
log_info "Current backups:"
ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  No backups found"

echo ""
log_info "Backup completed successfully!"
