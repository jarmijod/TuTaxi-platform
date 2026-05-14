import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', permissions: ['*'] },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT', permissions: ['trips:create', 'trips:read', 'profile:update'] },
  });

  const driverRole = await prisma.role.upsert({
    where: { name: 'DRIVER' },
    update: {},
    create: { name: 'DRIVER', permissions: ['trips:accept', 'trips:read', 'profile:update', 'vehicle:manage'] },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@tutaxi.com' },
    update: {},
    create: {
      email: 'admin@tutaxi.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'TuTaxi',
      roleId: adminRole.id,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✅ Seed completed: roles and admin user created');
  console.log(`   Admin: admin@tutaxi.com / Admin123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
