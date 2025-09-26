# Harachi ERP Frontend

Modern React frontend for the multi-tenant ERP system with role-based access control.

## Features

### 🏗️ **Multi-Tenant Architecture**
- **Super Admin**: System-wide company management
- **Company Admin**: Company setup wizard and configuration
- **Branch Admin**: Local branch operations
- **Role-based UI**: Dynamic navigation based on user permissions

### 🎨 **Modern UI/UX**
- **Tailwind CSS** for responsive, modern design
- **Lucide React** icons for consistent iconography
- **Headless UI** for accessible components
- **Recharts** for analytics and reporting

### 🔐 **Authentication & Security**
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes and components
- Automatic token refresh

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 3000

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## User Flows

### 1. Super Admin Flow
```
Login → Dashboard → Companies → Create/Edit Company → Assign Super Admin → Company Portal Access
```

**Pages:**
- `/admin/companies` - Company management
- `/admin/users` - Global user management
- `/admin/dashboard` - System overview

### 2. Company Admin Flow
```
Login → Setup Wizard → Create Countries → Create Branches → Assign Branch Admins → Configure System
```

**Pages:**
- `/company/setup` - Setup wizard
- `/company/countries` - Country management
- `/company/branches` - Branch management
- `/company/users` - User management

### 3. Branch Admin Flow
```
Login → Local Dashboard → Manage Inventory, Sales, Purchases, Finance, Users
```

**Pages:**
- `/branch/dashboard` - Local dashboard
- `/branch/inventory` - Inventory management
- `/branch/sales` - Sales management
- `/branch/purchases` - Purchase management
- `/branch/finance` - Finance management
- `/branch/reports` - Analytics and reports

## Component Structure

```
src/
├── components/
│   └── Layout/
│       ├── Header.tsx          # Top navigation
│       ├── Sidebar.tsx         # Role-based navigation
│       └── Layout.tsx          # Main layout wrapper
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── pages/
│   ├── Login.tsx               # Login page
│   ├── Dashboard.tsx           # Main dashboard
│   ├── admin/
│   │   └── Companies.tsx        # Company management
│   └── company/
│       └── SetupWizard.tsx     # Company setup wizard
├── services/
│   └── api.ts                  # API service layer
├── types/
│   └── index.ts                # TypeScript definitions
└── App.tsx                     # Main app with routing
```

## Role-Based Navigation

The sidebar automatically shows/hides navigation items based on user roles:

- **Super Admin**: All system management features
- **Company Admin**: Company setup and configuration
- **Branch Admin**: Local operations and management
- **Accountant**: Finance module only
- **Inventory Officer**: Inventory and purchases
- **Auditor**: Read-only access across modules

## API Integration

The frontend communicates with the NestJS backend through:

- **Authentication**: JWT tokens with automatic refresh
- **Company Management**: CRUD operations for companies
- **User Management**: Role-based user operations
- **Multi-tenant**: Company-scoped data access

## Styling

### Tailwind Configuration
- Custom color palette for primary/secondary colors
- Component classes for consistent styling
- Responsive design utilities

### Component Classes
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.card` - Content containers
- `.input-field` - Form inputs

## Development

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Code Structure
- **TypeScript** for type safety
- **Functional components** with hooks
- **Context API** for state management
- **React Router** for navigation
- **Axios** for API communication

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```bash
REACT_APP_API_URL=https://api.harachi.com
```

## Next Steps

1. **Phase 1**: Complete inventory, sales, and finance modules
2. **Phase 2**: Add production and banking modules
3. **Phase 3**: Integrations and mobile app
4. **Analytics**: Advanced reporting with Recharts
5. **Testing**: Unit and integration tests