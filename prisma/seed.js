const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Test kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@gurbetbiz.app' },
    update: {},
    create: {
      email: 'test@gurbetbiz.app',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Kullanıcı',
      countryCode: '+90',
      phone: '5551234567',
      birthDay: '01',
      birthMonth: '01',
      birthYear: '1990',
      gender: 'male',
      identityNumber: '12345678901',
      isForeigner: false,
      status: 'active',
      role: 'user'
    },
  });

  console.log('Test kullanıcısı oluşturuldu:', user.email);

  // Test kullanıcısı için örnek yolcu oluştur
  const passenger = await prisma.passenger.upsert({
    where: {
      userId_identityNumber: {
        userId: user.id,
        identityNumber: '11111111111'
      }
    },
    update: {},
    create: {
      userId: user.id,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      identityNumber: '11111111111',
      isForeigner: false,
      birthDay: '15',
      birthMonth: 'Mart',
      birthYear: '1985',
      gender: 'male',
      countryCode: '+90',
      phone: '5551234567',
      hasMilCard: false,
      hasPassport: false,
      status: 'active'
    },
  });

  console.log('Test yolcusu oluşturuldu:', passenger.firstName, passenger.lastName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 