const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [,, email, newPassword] = process.argv;
  if (!email || !newPassword) {
    console.error('Kullanım: node scripts/reset-password.js <email> <newPassword>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('Kullanıcı bulunamadı:', email);
      process.exit(2);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed, status: 'active' } });

    console.log(JSON.stringify({ ok: true, email }, null, 2));
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

main();


