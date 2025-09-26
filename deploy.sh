#!/bin/bash

# Harachi ERP Deployment Script
# This script deploys the complete multi-tenant ERP system

set -e

echo "🚀 Starting Harachi ERP Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.production .env
    print_warning "Please update .env file with your production values before continuing."
    print_warning "Required variables: POSTGRES_PASSWORD, JWT_SECRET, REACT_APP_API_URL"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$REACT_APP_API_URL" ]; then
    print_error "Required environment variables are missing. Please check your .env file."
    exit 1
fi

print_status "Environment variables loaded successfully."

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p database
mkdir -p logs

# Generate SSL certificates (self-signed for development)
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_status "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_status "SSL certificates generated."
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres; then
    print_status "✅ PostgreSQL is ready"
else
    print_error "❌ PostgreSQL is not ready"
    exit 1
fi

# Check Backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ Backend is ready"
else
    print_error "❌ Backend is not ready"
    exit 1
fi

# Check Frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Frontend is ready"
else
    print_error "❌ Frontend is not ready"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data
print_status "Seeding initial data..."
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed

print_status "🎉 Deployment completed successfully!"
print_status "🌐 Frontend: https://localhost"
print_status "🔧 Backend API: https://localhost/api"
print_status "📊 Database: PostgreSQL on localhost:5432"

print_status "📋 Next steps:"
print_status "1. Update DNS records to point to your server"
print_status "2. Replace self-signed SSL certificates with production certificates"
print_status "3. Configure firewall rules for ports 80, 443, and 5432"
print_status "4. Set up monitoring and logging"
print_status "5. Create backup strategy for PostgreSQL"

print_status "🔍 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "🛑 To stop services: docker-compose -f docker-compose.prod.yml down"
