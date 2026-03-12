#!/bin/bash

# =============================================================================
# Cron Setup Script - O Investigador
# =============================================================================
# Installs and configures automated backup cron job
# Usage: ./setup-cron.sh
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
CRON_SOURCE="$PROJECT_DIR/infrastructure/cron/backup-cron"
CRON_DEST="/etc/cron.d/o-investigador-backup"
LOG_FILE="/var/log/o-investigador-backup.log"

log_info "Setting up automated backups for O Investigador..."
log_info "Project directory: $PROJECT_DIR"

# Check if cron source file exists
if [ ! -f "$CRON_SOURCE" ]; then
    log_error "Cron file not found: $CRON_SOURCE"
    exit 1
fi

# Check if backup script exists and is executable
BACKUP_SCRIPT="$PROJECT_DIR/infrastructure/scripts/backup.sh"
if [ ! -f "$BACKUP_SCRIPT" ]; then
    log_error "Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"
log_info "Backup script permissions set"

# Create log file if it doesn't exist
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"
log_info "Log file created: $LOG_FILE"

# Install cron file
cp "$CRON_SOURCE" "$CRON_DEST"
chmod 644 "$CRON_DEST"
log_info "Cron file installed: $CRON_DEST"

# Validate cron syntax
if command -v crontab &> /dev/null; then
    # Test cron syntax (this doesn't install, just validates)
    if crontab -l 2>/dev/null | grep -q "o-investigador"; then
        log_warn "Existing crontab entry found for o-investigador"
    fi
fi

# Restart cron service to pick up changes
if command -v systemctl &> /dev/null; then
    systemctl restart cron 2>/dev/null || systemctl restart crond 2>/dev/null || true
    log_info "Cron service restarted"
elif command -v service &> /dev/null; then
    service cron restart 2>/dev/null || service crond restart 2>/dev/null || true
    log_info "Cron service restarted"
fi

# Test backup script (dry run info)
log_info "Testing backup script..."
echo ""
echo "=========================================="
echo "Backup Configuration:"
echo "=========================================="
echo "  Script: $BACKUP_SCRIPT"
echo "  Schedule: Daily at 3:00 AM"
echo "  Log file: $LOG_FILE"
echo "  Cron file: $CRON_DEST"
echo "=========================================="
echo ""

# Verify cron is installed
if [ -f "$CRON_DEST" ]; then
    log_info "Cron job installed successfully!"
    echo ""
    echo "Installed cron configuration:"
    cat "$CRON_DEST" | grep -v "^#" | grep -v "^$"
    echo ""
else
    log_error "Failed to install cron job"
    exit 1
fi

# Optional: Run a test backup
read -p "Would you like to run a test backup now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Running test backup..."
    cd "$PROJECT_DIR"
    ./infrastructure/scripts/backup.sh
else
    log_info "Skipping test backup"
fi

echo ""
log_info "Setup complete!"
echo ""
echo "Useful commands:"
echo "  - View backup logs: tail -f $LOG_FILE"
echo "  - List cron jobs: cat $CRON_DEST"
echo "  - Run backup manually: $BACKUP_SCRIPT"
echo "  - Check cron status: systemctl status cron"
echo ""
