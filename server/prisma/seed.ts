import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Harachi super admin
  const harachi = await prisma.harachi.upsert({
    where: { id: 'harachi-001' },
    update: {},
    create: {
      id: 'harachi-001',
      name: 'Harachi ERP System',
    },
  });

  // Create default roles for a company
  const defaultRoles = [
    {
      name: 'Super Admin',
      description: 'Full system access',
      permissions: ['*'],
    },
    {
      name: 'Company Admin',
      description: 'Company-wide administration',
      permissions: ['company.*', 'users.*', 'inventory.*', 'finance.*', 'sales.*', 'purchases.*'],
    },
    {
      name: 'Branch Admin',
      description: 'Branch-level administration',
      permissions: ['branch.*', 'inventory.*', 'finance.*', 'sales.*', 'purchases.*'],
    },
    {
      name: 'Accountant',
      description: 'Finance module access only',
      permissions: ['finance.*'],
    },
    {
      name: 'Inventory Officer',
      description: 'Inventory and purchases access',
      permissions: ['inventory.*', 'purchases.*'],
    },
    {
      name: 'Auditor',
      description: 'Read-only access across modules',
      permissions: ['read.*'],
    },
  ];

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
