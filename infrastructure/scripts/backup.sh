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

# Upload to S3 (if configured)
if [ -n "$AWS_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    log_info "Uploading to S3..."
    aws s3 cp "$FINAL_FILE" "s3://$AWS_BUCKET/backups/$(basename $FINAL_FILE)" && \
        log_info "Uploaded to S3 successfully!" || \
        log_error "S3 upload failed (local backup preserved)"
fi

# Cleanup old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log_info "Deleted $DELETED old backup(s)"

# List current backups
echo ""
log_info "Current backups:"
ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "  No backups found"

echo ""
log_info "Backup completed successfully!"
