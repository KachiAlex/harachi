// Seed sample roles and a user profile for RBAC
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function run() {
  const tenantId = process.env.SEED_TENANT_ID || 'harachi-demo';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'onyedika.akoma@gmail.com';
  const adminUid = process.env.SEED_ADMIN_UID || 'seed-admin-uid';

  const rolesCol = db.collection('roles');
  const usersCol = db.collection('users');

  const roles = [
    {
      name: 'System Admin',
      tenantId: null,
      permissions: [
        'admin:tenants:read','admin:tenants:write','tenant:settings:read','tenant:settings:write',
        'inventory:read','inventory:write','production:read','production:write',
        'procurement:read','procurement:write','quality:read','quality:write','reports:read','global:read'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Tenant Admin',
      tenantId,
      permissions: [
        'tenant:settings:read','tenant:settings:write',
        'inventory:read','inventory:write','production:read','production:write',
        'procurement:read','procurement:write','quality:read','quality:write','reports:read'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const createdRoleIds = [];
  for (const role of roles) {
    const ref = await rolesCol.add(role);
    createdRoleIds.push({ id: ref.id, name: role.name });
  }

  const tenantAdminRoleId = createdRoleIds.find(r => r.name === 'Tenant Admin')?.id;

  await usersCol.doc(adminUid).set({
    email: adminEmail,
    displayName: 'Seed Admin',
    tenantId,
    countryId: null,
    branchId: null,
    roleId: tenantAdminRoleId || null,
    permissions: roles[0].permissions, // grant full initially
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });

  console.log('Seed complete:', { tenantId, adminEmail, tenantAdminRoleId });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


