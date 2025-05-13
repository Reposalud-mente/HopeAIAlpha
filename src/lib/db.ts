/**
 * Database Connection Utility
 * 
 * This file provides a unified interface for database connections,
 * supporting both development and production environments with Supabase integration.
 */

import { PrismaClient } from '@prisma/client';
import prismaAlpha from './prisma-alpha';

// Import the default Prisma client (if it exists)
let prismaDefault: PrismaClient;

try {
  // Try to import the default Prisma client
  // This is a dynamic import to avoid errors if the file doesn't exist
  const { default: defaultClient } = await import('./prisma');
  prismaDefault = defaultClient;
} catch (error) {
  // If the default Prisma client doesn't exist, create a new one
  prismaDefault = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Get the appropriate Prisma client based on the environment
 * @returns PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  // Check if we're in the Alpha environment
  // We're considering multiple ways to detect the Alpha environment
  const isAlphaEnv =
    process.env.NODE_ENV === 'alpha' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'alpha' ||
    // Check if the DATABASE_URL contains Supabase identifiers
    (process.env.DATABASE_URL &&
      (process.env.DATABASE_URL.includes('supabase') ||
       process.env.DATABASE_URL.includes('pooler.supabase')));

  if (process.env.NODE_ENV === 'development') {
    console.log(`Using ${isAlphaEnv ? 'Alpha (Supabase)' : 'Default'} Prisma client`);
  }

  // Return the appropriate Prisma client
  return isAlphaEnv ? prismaAlpha : prismaDefault;
}

// Export a default Prisma client instance
const db = getPrismaClient();
export default db;

// Export type for use in the application
export type Database = typeof db;

/**
 * Execute a database operation with error handling
 * 
 * @param operation - Function that performs a database operation
 * @returns Result of the database operation
 */
export async function withDb<T>(operation: (db: Database) => Promise<T>): Promise<T> {
  try {
    return await operation(db);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}

/**
 * Execute a database transaction with error handling
 * 
 * @param transaction - Function that performs a database transaction
 * @returns Result of the database transaction
 */
export async function withTransaction<T>(
  transaction: (tx: any) => Promise<T>
): Promise<T> {
  try {
    return await db.$transaction(transaction);
  } catch (error) {
    console.error('Database transaction failed:', error);
    throw error;
  }
}
