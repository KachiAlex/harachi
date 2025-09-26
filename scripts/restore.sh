#!/bin/bash

# Harachi ERP Database Restore Script
# This script restores the database from a backup file

set -e

# Configuration
BACKUP_DIR="/var/backups/harachi-erp"

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

# Check if backup file is provided
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <backup_file>"
    print_status "Available backups:"
    ls -la "$BACKUP_DIR"/harachi_erp_backup_*.sql.gz 2>/dev/null || print_warning "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_status "Starting database restore from: $BACKUP_FILE"

# Confirm restore operation
read -p "⚠️  This will overwrite the current database. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    print_status "Restore cancelled."
    exit 0
fi

# Stop services
print_status "Stopping services..."
docker-compose -f docker-compose.prod.yml stop backend

# Create database backup before restore
print_status "Creating safety backup..."
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -h localhost harachi_erp > "$BACKUP_DIR/$SAFETY_BACKUP"

# Drop and recreate database
print_status "Dropping and recreating database..."
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS harachi_erp;"
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE DATABASE harachi_erp;"

# Restore from backup
print_status "Restoring database..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d harachi_erp
else
    cat "$BACKUP_FILE" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d harachi_erp
fi

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml start backend

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Verify restore
print_status "Verifying restore..."
if docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull > /dev/null 2>&1; then
    print_status "✅ Database restore completed successfully!"
else
    print_error "❌ Database restore failed!"
    print_status "🔄 Restoring from safety backup..."
    gunzip -c "$BACKUP_DIR/$SAFETY_BACKUP" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d harachi_erp
    print_status "✅ Safety backup restored"
fi

print_status "🎉 Restore operation completed!"
print_status "📁 Safety backup: $BACKUP_DIR/$SAFETY_BACKUP"
