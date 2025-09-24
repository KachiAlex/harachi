const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedFirestore() {
  console.log('🌱 Seeding Firestore with initial data...');

  try {
    // 1. Create system admin user
    const adminUser = await admin.auth().createUser({
      email: 'onyedika.akoma@gmail.com',
      password: 'dikaoliver2660',
      displayName: 'System Administrator'
    });

    console.log('✅ Created admin user:', adminUser.uid);

    // 2. Create tenant
    const tenantData = {
      id: 'harachi-demo',
      name: 'Harachi Demo Tenant',
      slug: 'harachi-demo',
      domain: 'harachi-demo.harachi.app',
      subscriptionTier: 'ENTERPRISE',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: adminUser.uid,
      updatedBy: adminUser.uid
    };

    await db.collection('tenants').doc('harachi-demo').set(tenantData);
    console.log('✅ Created tenant:', tenantData.name);

    // 3. Create user profile for admin
    const userProfile = {
      uid: adminUser.uid,
      email: 'onyedika.akoma@gmail.com',
      displayName: 'System Administrator',
      role: 'SYSTEM_ADMIN',
      tenantId: 'harachi-demo',
      permissions: [
        'admin:tenants:read',
        'admin:tenants:write',
        'tenant:settings:read',
        'tenant:settings:write',
        'inventory:read',
        'inventory:write',
        'production:read',
        'production:write',
        'procurement:read',
        'procurement:write',
        'quality:read',
        'quality:write',
        'reports:read',
        'global:read'
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(adminUser.uid).set(userProfile);
    console.log('✅ Created user profile for admin');

    // 4. Create company
    const companyData = {
      id: 'harachi-demo',
      name: 'Harachi Demo Company',
      taxId: 'TAX123456789',
      slug: 'harachi-demo',
      subscriptionTier: 'ENTERPRISE',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('companies').doc('harachi-demo').set(companyData);
    console.log('✅ Created company:', companyData.name);

    // 5. Create countries
    const countries = [
      {
        id: 'nigeria',
        companyId: 'harachi-demo',
        name: 'Nigeria',
        countryCode: 'NG',
        currencyCode: 'NGN',
        taxSystem: 'VAT',
        timezone: 'Africa/Lagos',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'kenya',
        companyId: 'harachi-demo',
        name: 'Kenya',
        countryCode: 'KE',
        currencyCode: 'KES',
        taxSystem: 'VAT',
        timezone: 'Africa/Nairobi',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'ghana',
        companyId: 'harachi-demo',
        name: 'Ghana',
        countryCode: 'GH',
        currencyCode: 'GHS',
        taxSystem: 'VAT',
        timezone: 'Africa/Accra',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const country of countries) {
      await db.collection('countries').doc(country.id).set(country);
    }
    console.log('✅ Created countries:', countries.map(c => c.name).join(', '));

    // 6. Create branches
    const branches = [
      {
        id: 'lagos-brewery',
        countryId: 'nigeria',
        name: 'Lagos Brewery',
        branchCode: 'LAG-BRW',
        branchType: 'BREWERY',
        address: {
          streetAddress: '123 Brewery Street',
          city: 'Lagos',
          stateProvince: 'Lagos State',
          postalCode: '100001',
          countryCode: 'NG'
        },
        contactInfo: {
          phone: '+234-1-234-5678',
          email: 'lagos@harachi-demo.com',
          website: 'https://harachi-demo.com'
        },
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'nairobi-brewery',
        countryId: 'kenya',
        name: 'Nairobi Brewery',
        branchCode: 'NAI-BRW',
        branchType: 'BREWERY',
        address: {
          streetAddress: '456 Brewery Avenue',
          city: 'Nairobi',
          stateProvince: 'Nairobi County',
          postalCode: '00100',
          countryCode: 'KE'
        },
        contactInfo: {
          phone: '+254-20-123-4567',
          email: 'nairobi@harachi-demo.com'
        },
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'accra-packaging',
        countryId: 'ghana',
        name: 'Accra Packaging Plant',
        branchCode: 'ACC-PKG',
        branchType: 'PACKAGING',
        address: {
          streetAddress: '789 Industrial Road',
          city: 'Accra',
          stateProvince: 'Greater Accra',
          postalCode: 'GA-123-4567',
          countryCode: 'GH'
        },
        contactInfo: {
          phone: '+233-30-123-4567',
          email: 'accra@harachi-demo.com'
        },
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const branch of branches) {
      await db.collection('branches').doc(branch.id).set(branch);
    }
    console.log('✅ Created branches:', branches.map(b => b.name).join(', '));

    // 7. Create warehouses
    const warehouses = [
      {
        id: 'lagos-raw-materials',
        branchId: 'lagos-brewery',
        code: 'LAG-RM',
        name: 'Lagos Raw Materials Warehouse',
        warehouseType: 'RAW_MATERIALS',
        temperatureControlled: true,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'lagos-finished-goods',
        branchId: 'lagos-brewery',
        code: 'LAG-FG',
        name: 'Lagos Finished Goods Warehouse',
        warehouseType: 'FINISHED_GOODS',
        temperatureControlled: true,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'nairobi-raw-materials',
        branchId: 'nairobi-brewery',
        code: 'NAI-RM',
        name: 'Nairobi Raw Materials Warehouse',
        warehouseType: 'RAW_MATERIALS',
        temperatureControlled: true,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const warehouse of warehouses) {
      await db.collection('warehouses').doc(warehouse.id).set(warehouse);
    }
    console.log('✅ Created warehouses:', warehouses.map(w => w.name).join(', '));

    console.log('🎉 Firestore seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin user: onyedika.akoma@gmail.com / dikaoliver2660');
    console.log('- Tenant: harachi-demo');
    console.log('- Countries: Nigeria, Kenya, Ghana');
    console.log('- Branches: Lagos Brewery, Nairobi Brewery, Accra Packaging');
    console.log('- Warehouses: Raw materials and finished goods');

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding
seedFirestore().then(() => {
  console.log('✅ Seeding complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
