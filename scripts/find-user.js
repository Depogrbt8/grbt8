const { PrismaClient } = require('@prisma/client');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Kullanım: node scripts/find-user.js <email>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        password: true,
        createdAt: true,
      }
    });

    if (!user) {
      console.log(JSON.stringify({ exists: false }, null, 2));
    } else {
      console.log(JSON.stringify({
        exists: true,
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        status: user.status,
        hasPassword: Boolean(user.password),
        createdAt: user.createdAt
      }, null, 2));
    }
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();


