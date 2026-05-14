"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
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
//# sourceMappingURL=seed.js.map