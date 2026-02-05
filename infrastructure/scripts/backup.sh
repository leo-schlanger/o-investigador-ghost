#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup MySQL
docker exec o-investigador-db mysqldump \
  -u ghost -p"${DB_PASSWORD:-changeme_secure_password_123}" \
  o_investigador > \
  $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Comprime
gzip $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Upload S3 (opcional)
# aws s3 cp $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz \
#   s3://o-investigador-backups/db_backup_$TIMESTAMP.sql.gz

echo "Backup criado: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Manter apenas ultimos 7 backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
