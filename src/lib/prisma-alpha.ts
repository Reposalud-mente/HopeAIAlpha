/**
 * Prisma Client for HopeAI Platform
 *
 * This file provides the standardized Prisma client using the Alpha schema
 * with Supabase as the database backend.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Create a new PrismaClient instance with proper configuration
 * When running with pnpm dev:alpha, the DATABASE_URL from .env.alpha will be used
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Log queries during development for better debugging
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],

    // Ensure we're using the correct database connection
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

const globalForPrisma = globalThis as unknown as {
  prismaAlpha: ReturnType<typeof prismaClientSingleton>
};

// Use existing instance or create a new one
export const prismaAlpha = globalForPrisma.prismaAlpha ?? prismaClientSingleton();

// Store the instance in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaAlpha = prismaAlpha;
}

export default prismaAlpha;
