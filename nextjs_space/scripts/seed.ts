import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { role: 'admin', approved: true, passwordHash },
    create: {
      email: 'john@doe.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
      approved: true,
    },
  });

  console.log('Admin user seeded.');
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
