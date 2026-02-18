import { PrismaClient } from '@prisma/client'
import path from 'path'

function createPrismaClient(): PrismaClient {
  // Use require() to avoid ESM/bundler issues with native modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const db = new Database(dbPath)
  const adapter = new PrismaBetterSqlite3(db)
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
