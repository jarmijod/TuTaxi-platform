import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Test1234!', 12);

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

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tutaxi.com' },
    update: {},
    create: {
      email: 'admin@tutaxi.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'TuTaxi',
      phone: '+34600000001',
      roleId: adminRole.id,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Client user
  const client = await prisma.user.upsert({
    where: { email: 'cliente@tutaxi.com' },
    update: {},
    create: {
      email: 'cliente@tutaxi.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+34600000002',
      roleId: clientRole.id,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Driver user
  const driverUser = await prisma.user.upsert({
    where: { email: 'conductor@tutaxi.com' },
    update: {},
    create: {
      email: 'conductor@tutaxi.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'García',
      phone: '+34600000003',
      roleId: driverRole.id,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Driver profile
  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'DL-ESP-123456',
      status: 'AVAILABLE',
      rating: 4.8,
      totalTrips: 150,
      isVerified: true,
    },
  });

  // Vehicle
  await prisma.vehicle.upsert({
    where: { plateNumber: '1234-ABC' },
    update: {},
    create: {
      driverId: driver.id,
      brand: 'Toyota',
      model: 'Prius',
      year: 2023,
      color: 'Negro',
      plateNumber: '1234-ABC',
      capacity: 4,
    },
  });

  // Second driver
  const driverUser2 = await prisma.user.upsert({
    where: { email: 'conductor2@tutaxi.com' },
    update: {},
    create: {
      email: 'conductor2@tutaxi.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'López',
      phone: '+34600000004',
      roleId: driverRole.id,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { userId: driverUser2.id },
    update: {},
    create: {
      userId: driverUser2.id,
      licenseNumber: 'DL-ESP-789012',
      status: 'AVAILABLE',
      rating: 4.9,
      totalTrips: 320,
      isVerified: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { plateNumber: '5678-DEF' },
    update: {},
    create: {
      driverId: driver2.id,
      brand: 'Hyundai',
      model: 'Ioniq',
      year: 2024,
      color: 'Blanco',
      plateNumber: '5678-DEF',
      capacity: 4,
    },
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Test accounts (password: Test1234!):');
  console.log('   Admin:     admin@tutaxi.com');
  console.log('   Cliente:   cliente@tutaxi.com');
  console.log('   Conductor: conductor@tutaxi.com');
  console.log('   Conductor: conductor2@tutaxi.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
