#!/bin/bash

# Harachi ERP Database Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/var/backups/harachi-erp"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="harachi_erp_backup_${DATE}.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

print_status "Starting database backup..."

# Create backup
print_status "Creating backup: $BACKUP_FILE"
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -h localhost harachi_erp > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
print_status "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Verify backup
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    print_status "✅ Backup created successfully: $BACKUP_FILE"
    print_status "📁 Backup size: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
else
    print_error "❌ Backup failed!"
    exit 1
fi

# Clean up old backups
print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "harachi_erp_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List current backups
print_status "Current backups:"
ls -lh "$BACKUP_DIR"/harachi_erp_backup_*.sql.gz 2>/dev/null || print_warning "No previous backups found"

print_status "🎉 Backup completed successfully!"
print_status "📁 Backup location: $BACKUP_DIR/$BACKUP_FILE"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://your-backup-bucket/
# gcloud storage cp "$BACKUP_DIR/$BACKUP_FILE" gs://your-backup-bucket/

print_status "💡 To restore from backup:"
print_status "   gunzip -c $BACKUP_DIR/$BACKUP_FILE | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d harachi_erp"
