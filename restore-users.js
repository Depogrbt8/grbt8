const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Test kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'test@gurbet.biz' },
    update: {},
    create: {
      email: 'test@gurbet.biz',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      countryCode: '+90',
      phone: '5551234567',
      birthDay: '15',
      birthMonth: '6',
      birthYear: '1990',
      gender: 'male',
      identityNumber: '12345678901',
      isForeigner: false,
      status: 'active'
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'demo@gurbet.biz' },
    update: {},
    create: {
      email: 'demo@gurbet.biz',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      countryCode: '+90',
      phone: '5559876543',
      birthDay: '20',
      birthMonth: '8',
      birthYear: '1985',
      gender: 'female',
      identityNumber: '98765432109',
      isForeigner: false,
      status: 'active'
    },
  });

  console.log('Test kullanıcıları oluşturuldu:');
  console.log('1. Email: test@gurbet.biz - Şifre: test123');
  console.log('2. Email: demo@gurbet.biz - Şifre: test123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




