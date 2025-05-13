/**
 * Test Database Connection
 * 
 * This script tests the connection to the database.
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.alpha
dotenv.config({ path: path.join(__dirname, '..', '.env.alpha') });

async function main() {
  console.log('Testing database connection...');
  console.log('Database URL:', process.env.DATABASE_URL);
  
  // Create a new Prisma client
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('Database information:', result);
    
    // Test if the schema exists
    const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata`;
    console.log('Available schemas:', schemas);
    
    // Check if hopeai_alpha schema exists
    const hopeaiSchema = schemas.find(schema => schema.schema_name === 'hopeai_alpha');
    if (hopeaiSchema) {
      console.log('hopeai_alpha schema found!');
      
      // List all tables in the hopeai_alpha schema
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'hopeai_alpha'
      `;
      console.log('Tables in hopeai_alpha schema:', tables);
    } else {
      console.log('hopeai_alpha schema not found.');
    }
    
    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Test completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });