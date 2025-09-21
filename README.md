# BrewERP - Multi-Tenant Brewery Management System

A comprehensive ERP solution designed specifically for brewery operations with multi-country, multi-tenant support. Built with React, TypeScript, and modern web technologies.

## 🍺 Features

### Multi-Tenant Architecture
- **Company Management**: Support for multiple brewery companies in a single instance
- **Country Operations**: Manage operations across different countries with local currency and tax systems
- **Branch Management**: Handle multiple locations (breweries, packaging facilities, distribution centers)
- **Warehouse Management**: Track inventory across different storage locations

### Core Modules

#### 📦 Inventory Management
- **Item Classes**: Hierarchical classification system (Raw Materials, Packaging, Finished Goods)
- **Item Master**: Complete SKU management with UOM conversions
- **Stock Balances**: Real-time inventory tracking with lot/serial support
- **Inventory Transactions**: Full audit trail of all inventory movements

#### 🏭 Production Management
- **Recipes**: Brewing formulations and ingredient specifications
- **Production Orders**: Batch management and scheduling
- **Batch Tracking**: Complete batch lifecycle with quality attributes
- **Material Consumption**: Automatic inventory allocation and consumption

#### 🛒 Procurement
- **Purchase Orders**: Supplier management and ordering
- **Goods Receipts**: Incoming shipment processing with lot creation
- **Supplier Management**: Vendor relationships and contact information

#### 🔬 Quality Control
- **QC Tests**: Quality testing workflows and parameters
- **Test Results**: Pass/fail tracking with detailed measurements
- **Traceability**: Full upstream and downstream lot tracking
- **Non-Conformance**: Quality issue management and corrective actions

#### 🌍 Multi-Country Operations
- **Inter-Country Transfers**: Cross-border inventory movements
- **Customs Integration**: Customs reference tracking
- **Global Reporting**: Consolidated reporting across all countries
- **Currency Support**: Multi-currency operations with exchange rates

### Technical Features
- **Real-time Updates**: Live data synchronization across all users
- **Audit Trail**: Complete change tracking for compliance
- **Role-based Security**: Granular permissions by module and country
- **Document Management**: File attachments and document workflow
- **API-First Design**: RESTful APIs for all operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 13+ database
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/brewery-erp.git
   cd brewery-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb brewery_erp
   
   # Run the schema setup
   psql brewery_erp < database/brewery-erp-schema.sql
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API settings
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser
   - Default login: admin@brewery.com / admin123

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Lucide React** - Modern icon library

### Backend Integration
- **RESTful APIs** - Standard HTTP APIs with OpenAPI documentation
- **JWT Authentication** - Secure token-based authentication
- **Multi-tenant Data** - Tenant isolation at database level
- **Real-time Updates** - WebSocket connections for live data

### Database Design
- **PostgreSQL** - Primary database with JSONB support
- **Multi-tenant Schema** - Company-scoped data isolation
- **Audit Logging** - Complete change tracking
- **Performance Indexes** - Optimized for brewery operations

## 📁 Project Structure

```
brewery-erp/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/        # Layout components (TopBar, LeftNav, RightRail)
│   │   ├── inventory/     # Inventory-specific components
│   │   ├── production/    # Production module components
│   │   └── common/        # Shared UI components
│   ├── pages/             # Route-level page components
│   │   ├── inventory/     # Inventory management pages
│   │   ├── production/    # Production management pages
│   │   ├── procurement/   # Procurement pages
│   │   ├── quality/       # Quality control pages
│   │   └── multi-country/ # Multi-country operations
│   ├── store/             # State management (Zustand)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── database/              # Database schema and migrations
├── docs/                  # Documentation
└── README.md
```

## 🎯 Key Features Implemented

### ✅ Completed Features
- [x] Multi-tenant company/country/branch selection
- [x] Responsive layout with collapsible navigation
- [x] Item Classes hierarchical tree view with CRUD operations
- [x] Dashboard with key metrics and quick actions
- [x] Real-time context switching (company/country/branch)
- [x] Right rail for notes, files, and activities
- [x] Stock balances view with filtering
- [x] Complete database schema with relationships
- [x] TypeScript type definitions for all entities

### 🚧 In Development
- [ ] Item Master form with UOM conversion grid
- [ ] Production Order workflow
- [ ] Purchase Order → Goods Receipt flow
- [ ] QC Test entry and results tracking
- [ ] Inter-country transfer management
- [ ] Global reporting dashboard

### 📋 Roadmap
- [ ] Mobile-responsive design improvements
- [ ] Advanced filtering and search
- [ ] Batch recipe editor
- [ ] Automated reorder point calculations
- [ ] Integration with external systems (SAP, QuickBooks)
- [ ] Advanced analytics and forecasting

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

### Code Style
- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality

### Testing
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing (planned)

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following key entities:

- **Multi-tenant Core**: companies, countries, branches, warehouses
- **Inventory**: item_classes, items, stock_balances, inventory_transactions
- **Production**: recipes, production_orders, batch_attributes
- **Procurement**: purchase_orders, goods_receipts
- **Quality**: qc_tests, qc_results
- **Multi-country**: inter_country_transfers
- **System**: users, audit_logs, documents

See `database/brewery-erp-schema.sql` for complete schema definition.

## 🔐 Security & Compliance

- **Multi-tenant Isolation**: Complete data separation between companies
- **Role-based Access**: Granular permissions by module and location
- **Audit Logging**: Complete change tracking for regulatory compliance
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **GDPR Compliance**: Data privacy and right-to-be-forgotten support

## 🌍 Multi-Country Support

- **Currency Management**: Multi-currency with exchange rate support
- **Tax Systems**: Support for VAT, GST, and sales tax
- **Localization**: Date/time formats and number formatting
- **Customs Integration**: Tracking for international shipments
- **Regulatory Compliance**: Country-specific reporting requirements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **API Reference**: [brewery-erp-api.yaml](brewery-erp-api.yaml)
- **Issues**: [GitHub Issues](https://github.com/your-org/brewery-erp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/brewery-erp/discussions)

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- UI components inspired by Tailwind UI
- Icons provided by Lucide React
- Database design follows brewery industry best practices

---

**BrewERP** - Empowering breweries with modern technology 🍺
