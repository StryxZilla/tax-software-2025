const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const Database = require('better-sqlite3')

async function main() {
  const dbPath = path.join(__dirname, 'prisma', 'dev.db')
  const db = new Database(dbPath)

  const email = 'john.sample@testmail.com'
  const passwordHash = await bcrypt.hash('testpassword123', 12)

  const stmt = db.prepare(`
    INSERT INTO "User" (id, email, name, passwordHash, isAdmin, createdAt)
    VALUES (@id, @email, @name, @passwordHash, @isAdmin, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      passwordHash = excluded.passwordHash,
      isAdmin = excluded.isAdmin
  `)

  stmt.run({
    id: crypto.randomUUID(),
    email,
    name: 'John Sample',
    passwordHash,
    isAdmin: 1,
  })

  db.close()
  console.log(`Test user ready: ${email}`)
}

main().catch((error) => {
  console.error('Error creating test user:', error)
  process.exit(1)
})
