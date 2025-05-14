/**
 * Prisma Client Export
 * 
 * This file provides a simple re-export of the database client from db.ts
 * to maintain compatibility with existing code that imports from @/lib/prisma
 */

import db from './db';

// Export the database client as 'prisma' for compatibility
export const prisma = db;

// Also export as default
export default db;
