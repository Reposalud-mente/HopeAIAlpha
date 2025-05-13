// src/lib/prisma-alpha.ts
// Prisma client for the Alpha environment using the Supabase database connection

// Import the PrismaClient directly from the generated client for the Alpha schema
import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient instance
// When running with pnpm dev:alpha, the DATABASE_URL from .env.alpha will be used
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Log queries during development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Set the schema to hopeai_alpha
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { prismaAlpha: ReturnType<typeof prismaClientSingleton> };

export const prismaAlpha = globalForPrisma.prismaAlpha ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaAlpha = prismaAlpha;

export default prismaAlpha;
