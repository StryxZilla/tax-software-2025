const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');
const path = require('path');

function createPrismaClient() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  const url = `file:///${dbPath}`;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('test123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: passwordHash,
      isAdmin: false
    }
  });
  console.log('Created user:', user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
