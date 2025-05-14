/**
 * Database Connection Utility
 *
 * This file provides a unified interface for database connections using Supabase
 * with the Alpha schema as the sole database connection for the HopeAI platform.
 */

import { PrismaClient } from '@prisma/client';
import prismaAlpha from './prisma-alpha';

/**
 * Get the Prisma client for the Alpha environment
 * @returns PrismaClient instance configured for the Alpha environment
 */
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'development') {
    console.log('Using Alpha (Supabase) Prisma client');
  }

  // Always return the Alpha Prisma client
  return prismaAlpha;
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
