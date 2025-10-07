/*
 * Securely update a user's password via Prisma.
 * Usage: node scripts/set-password.js <email> <newPassword>
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [, , email, newPass] = process.argv;
  if (!email || !newPass) {
    console.error('Usage: node scripts/set-password.js <email> <newPassword>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(newPass, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hash },
      select: { id: true, email: true },
    });
    console.log('Password updated for', user.email);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


