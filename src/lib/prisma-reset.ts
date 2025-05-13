import { PrismaClient } from '@prisma/client'

// Force a new instance of PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export { prisma }
