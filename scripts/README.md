# Firestore Seeding Scripts

## Prerequisites

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Download your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `scripts/serviceAccountKey.json`

## Seed Initial Data

Run the seeding script to create:
- System admin user
- Demo tenant
- Countries (Nigeria, Kenya, Ghana)
- Branches and warehouses
- User profiles with proper permissions

```bash
node scripts/seed-firestore.js
```

## What Gets Created

### Users
- **Admin**: `onyedika.akoma@gmail.com` / `dikaoliver2660`
  - Role: SYSTEM_ADMIN
  - Permissions: All admin and tenant permissions

### Tenant
- **Name**: Harachi Demo Tenant
- **Slug**: harachi-demo
- **Tier**: ENTERPRISE
- **Domain**: harachi-demo.harachi.app

### Countries
- Nigeria (NG, NGN, VAT, Africa/Lagos)
- Kenya (KE, KES, VAT, Africa/Nairobi)  
- Ghana (GH, GHS, VAT, Africa/Accra)

### Branches
- Lagos Brewery (Nigeria)
- Nairobi Brewery (Kenya)
- Accra Packaging Plant (Ghana)

### Warehouses
- Raw materials warehouses (temperature controlled)
- Finished goods warehouses

## After Seeding

1. Login at https://harachi.web.app/login
2. Navigate to `/admin/tenants` to see tenant management
3. Navigate to `/t/harachi-demo/settings` to see tenant dashboard
4. Test multi-tenant context switching
