import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

function createPrismaClient(): PrismaClient {
  // For Windows, use absolute path with proper formatting
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/')
  const url = `file:///${dbPath}`

  const adapter = new PrismaLibSql({
    url,
  })
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
