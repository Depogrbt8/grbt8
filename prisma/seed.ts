import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword || testPassword.length < 6) {
    console.error('Hata: SEED_TEST_PASSWORD ortam değişkeni gerekli (en az 6 karakter).');
    console.error('Örnek: SEED_TEST_PASSWORD=test123 npx ts-node prisma/seed.ts');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  await prisma.user.upsert({
    where: { email: 'test@gurbetbiz.app' },
    update: {},
    create: {
      email: 'test@gurbetbiz.app',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Kullanıcı',
    },
  });
  console.log('Test kullanıcısı eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 