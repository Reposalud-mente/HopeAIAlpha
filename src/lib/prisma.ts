import { PrismaClient } from '@prisma/client'

// Prevent multiple instances during development with hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force a new instance of PrismaClient to ensure proper connection
const prismaClientOptions = {
  log: ['query', 'info', 'warn', 'error'],
}

// Clear any existing instance and create a new one
if (globalForPrisma.prisma) {
  // @ts-ignore - Access private property to disconnect
  if (globalForPrisma.prisma._engine) {
    globalForPrisma.prisma.$disconnect();
  }
  globalForPrisma.prisma = undefined;
}

export const prisma = new PrismaClient(prismaClientOptions)
globalForPrisma.prisma = prisma