# Harachi ERP Backend

Multi-tenant ERP system built with NestJS, PostgreSQL, and Prisma.

## Architecture

- **Multi-tenancy**: Schema-per-company strategy for data isolation
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful endpoints with NestJS

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Development Setup

1. **Install dependencies**
```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database setup**
```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed initial data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

### Docker Setup

```bash
# Start PostgreSQL and app
docker-compose up -d

# View logs
docker-compose logs -f app
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (requires JWT)

### Companies
- `POST /companies` - Create company
- `GET /companies` - List companies
- `GET /companies/:id` - Get company details
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company

## Multi-Tenant Strategy

### Schema-per-Company
Each company gets its own PostgreSQL schema for complete data isolation:

- **Global Schema**: `public` - Contains shared tables (companies, users, roles)
- **Company Schemas**: `company_[code]` - Contains business data (inventory, finance, etc.)

### User Roles
- **Super Admin**: Full system access
- **Company Admin**: Company-wide administration
- **Branch Admin**: Branch-level administration
- **Accountant**: Finance module only
- **Inventory Officer**: Inventory and purchases
- **Auditor**: Read-only access

## Database Schema

### Global Tables (public schema)
- `harachi` - System configuration
- `companies` - Tenant companies
- `users` - System users
- `roles` - Role definitions
- `user_roles` - User-role assignments
- `countries` - Company countries
- `branches` - Company branches
- `audit_logs` - System audit trail

### Company Tables (company schemas)
- `warehouses` - Storage locations
- `inventory_items` - Product catalog
- `transactions` - Inventory movements
- `chart_of_accounts` - Financial accounts
- `finance_entries` - Accounting entries
- `vendors` - Supplier management
- `customers` - Customer management
- `purchase_orders` - Procurement
- `sales_orders` - Sales management
- `invoices` - Billing

## Development

### Database Commands
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Create migration
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Testing
```bash
npm run test           # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Production
```bash
docker build -t harachi-backend .
docker run -p 3000:3000 harachi-backend
```

## Security

- JWT authentication with configurable expiration
- Role-based access control (RBAC)
- Data isolation per tenant
- Audit logging for all operations
- Input validation with class-validator

## Next Steps

1. **Phase 1 (MVP)**: Core modules (Admin, Finance, Inventory, Sales, Purchases)
2. **Phase 2**: Production module, Banking, Audit trails
3. **Phase 3**: Integrations, Mobile app, AI/Analytics