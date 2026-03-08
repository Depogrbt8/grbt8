const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    console.error('Hata: ADMIN_SEED_PASSWORD ortam değişkeni gerekli (en az 8 karakter).');
    console.error('Örnek: ADMIN_SEED_PASSWORD=YourSecurePass node prisma/seed-admin.js');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: 'admin@grbt8.store' },
    update: {
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'active'
    },
    create: {
      email: 'admin@grbt8.store',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'active'
    },
  });
  console.log('Admin kullanıcı eklendi/güncellendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
