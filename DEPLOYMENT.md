# Harachi ERP Deployment Guide

Complete deployment guide for the multi-tenant ERP system with Docker, PostgreSQL, and Nginx.

## 🚀 Quick Deployment

### Prerequisites
- Docker and Docker Compose installed
- OpenSSL for SSL certificate generation
- 4GB+ RAM and 20GB+ disk space
- Ports 80, 443, and 5432 available

### One-Command Deployment
```bash
# Clone and deploy
git clone <repository-url>
cd Harachi
./deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Environment Setup
```bash
# Copy environment template
cp env.production .env

# Edit with your production values
nano .env
```

**Required Environment Variables:**
```bash
POSTGRES_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
REACT_APP_API_URL=https://your-domain.com/api
```

### 2. SSL Certificate Setup
```bash
# Generate self-signed certificates (development)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"

# For production, use Let's Encrypt or commercial certificates
```

### 3. Database Initialization
```bash
# Create database initialization script
mkdir -p database
cat > database/init.sql << EOF
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS public;
EOF
```

### 4. Deploy Services
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Database Setup
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

## 🏗️ Architecture Overview

### Services
- **PostgreSQL**: Database with multi-tenant schemas
- **Backend**: NestJS API with Prisma ORM
- **Frontend**: React SPA with Nginx
- **Nginx**: Reverse proxy with SSL termination

### Network Flow
```
Internet → Nginx (SSL) → Frontend/Backend → PostgreSQL
```

## 🔧 Production Configuration

### Security Hardening
```bash
# Update Nginx configuration
# - Rate limiting
# - Security headers
# - SSL/TLS configuration
# - Request size limits
```

### Database Security
```bash
# PostgreSQL configuration
# - Connection limits
# - SSL connections
# - Backup encryption
# - Access controls
```

### Monitoring Setup
```bash
# Add health checks
# - Application health endpoints
# - Database connectivity
# - Service availability
# - Performance metrics
```

## 📊 Scaling Configuration

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Load Balancing
```nginx
# nginx/nginx.conf
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

### Database Scaling
```bash
# Read replicas
# - Master-slave replication
# - Connection pooling
# - Query optimization
```

## 🔄 Maintenance Operations

### Backup Strategy
```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres harachi_erp > backup.sql

# Automated backups
# Add to crontab: 0 2 * * * /path/to/backup.sh
```

### Updates and Rollbacks
```bash
# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Rollback
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --scale backend=1
```

### Log Management
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Log rotation
# Configure logrotate for production
```

## 🌐 Cloud Deployment

### AWS Deployment
```bash
# EC2 instance setup
# - t3.medium or larger
# - Security groups for ports 80, 443, 22
# - EBS volume for data persistence
# - Route 53 for DNS
```

### Azure Deployment
```bash
# Azure Container Instances
# - Container registry
# - Application gateway
# - Azure Database for PostgreSQL
# - Azure DNS
```

### Google Cloud Deployment
```bash
# Google Kubernetes Engine
# - Container registry
# - Load balancer
# - Cloud SQL for PostgreSQL
# - Cloud DNS
```

## 🔍 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 80, 443, 5432 are available
2. **SSL errors**: Verify certificate paths and permissions
3. **Database connection**: Check PostgreSQL service and credentials
4. **Memory issues**: Increase Docker memory limits

### Debug Commands
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View service logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Access service shell
docker-compose -f docker-compose.prod.yml exec [service-name] sh

# Check database connection
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Application metrics
curl http://localhost:3000/health
```

## 📈 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database credentials secured
- [ ] Firewall rules configured
- [ ] DNS records updated

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificate valid
- [ ] Database migrations completed
- [ ] Initial data seeded
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Security Checklist
- [ ] Strong passwords for all services
- [ ] SSL/TLS encryption enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Database access restricted
- [ ] Regular security updates scheduled

## 🆘 Support

For deployment issues:
1. Check service logs: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Check SSL certificate validity
5. Review firewall and DNS configuration

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://reactjs.org/docs/)
