// scripts/test-alpha-db.ts
// Test script to verify connection to the Alpha database

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
  console.log('Testing connection to Alpha database (Supabase)...');
  
  // Create a new Prisma client
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Connecting to Alpha database...');
    
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('Database information:', result);
    
    // Test if the schema exists
    const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hopeai_alpha'`;
    console.log('Schema information:', schemas);
    
    // List all tables in the schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'hopeai_alpha'
    `;
    console.log('Tables in hopeai_alpha schema:', tables);
    
    // If tables exist, try to query them
    if (Array.isArray(tables) && tables.length > 0) {
      // Test connection by querying the users table
      try {
        const userCount = await prisma.user.count();
        console.log(`Found ${userCount} users in the database.`);
        
        // Get a sample of users
        const users = await prisma.user.findMany({
          take: 3,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });
        
        console.log('Sample users:');
        console.log(JSON.stringify(users, null, 2));
      } catch (error) {
        console.error('Error querying users:', error.message);
      }
      
      // Test connection to patients table
      try {
        const patientCount = await prisma.patient.count();
        console.log(`Found ${patientCount} patients in the database.`);
        
        // Get a sample of patients
        const patients = await prisma.patient.findMany({
          take: 3,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            status: true,
            primaryProvider: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        
        console.log('Sample patients:');
        console.log(JSON.stringify(patients, null, 2));
      } catch (error) {
        console.error('Error querying patients:', error.message);
      }
    } else {
      console.log('No tables found in the hopeai_alpha schema. You may need to run migrations.');
    }
    
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
  } finally {
    // Close the Prisma client connection
    await prisma.$disconnect();
  }
}

main();
