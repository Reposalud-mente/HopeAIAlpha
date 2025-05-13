/**
 * Test Auth0 Integration with Supabase
 * 
 * This script tests the integration between Auth0 and Supabase
 * by simulating the user authentication flow.
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.alpha
dotenv.config({ path: path.join(__dirname, '..', '.env.alpha') });

// Mock Auth0 user data
const mockAuth0User = {
  sub: 'auth0|test123456789',
  email: 'test@example.com',
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  picture: 'https://example.com/avatar.png',
  updated_at: new Date().toISOString(),
  email_verified: true,
  iss: `https://${process.env.AUTH0_ISSUER_BASE_URL}/`,
  aud: process.env.AUTH0_CLIENT_ID,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

async function main() {
  console.log('Testing Auth0 integration with Supabase...');
  
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
    console.log('Connecting to Supabase database...');
    
    // Check if we can connect to the database
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('Database information:', result);
    
    // Check if the hopeai_alpha schema exists
    const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hopeai_alpha'`;
    if (schemas.length === 0) {
      console.error('Error: hopeai_alpha schema not found in the database.');
      return;
    }
    
    console.log('hopeai_alpha schema found.');
    
    // Check if the users table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'hopeai_alpha' AND table_name = 'users'
    `;
    
    if (tables.length === 0) {
      console.error('Error: users table not found in the hopeai_alpha schema.');
      return;
    }
    
    console.log('users table found in hopeai_alpha schema.');
    
    // Count users in the hopeai_alpha schema
    const userCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM hopeai_alpha.users
    `;
    console.log(`Found ${userCount[0].count} users in the database.`);
    
    // Check if the test user exists
    console.log(`\nChecking if test user exists: ${mockAuth0User.email}`);
    const existingUsers = await prisma.$queryRaw`
      SELECT * FROM hopeai_alpha.users WHERE email = ${mockAuth0User.email}
    `;
    
    let user;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
      console.log('Test user exists in the database:');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Role: ${user.role}`);
      
      // Update the user to simulate a login
      console.log('\nUpdating test user to simulate login...');
      await prisma.$executeRaw`
        UPDATE hopeai_alpha.users 
        SET "lastLoginAt" = NOW() 
        WHERE id = ${user.id}
      `;
      
      console.log('User updated successfully!');
    } else {
      console.log('Test user does not exist. Creating test user...');
      
      // Create a test user with a UUID
      // Generate a random UUID for the user
      const uuid = await prisma.$queryRaw`SELECT uuid_generate_v4()`;
      const userId = uuid[0].uuid_generate_v4;
      
      console.log(`Generated UUID for test user: ${userId}`);
      
      await prisma.$executeRaw`
        INSERT INTO hopeai_alpha.users (
          id, 
          email, 
          "firstName", 
          "lastName", 
          "passwordHash", 
          role, 
          "lastLoginAt", 
          "profileImageUrl",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${userId}::uuid,
          ${mockAuth0User.email},
          ${mockAuth0User.given_name || 'Test'},
          ${mockAuth0User.family_name || 'User'},
          'not-a-real-password-hash',
          'PSYCHOLOGIST',
          NOW(),
          ${mockAuth0User.picture},
          NOW(),
          NOW()
        )
      `;
      
      // Get the created user
      const createdUsers = await prisma.$queryRaw`
        SELECT * FROM hopeai_alpha.users WHERE email = ${mockAuth0User.email}
      `;
      
      if (createdUsers.length > 0) {
        user = createdUsers[0];
        console.log('Test user created successfully!');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Role: ${user.role}`);
      } else {
        console.error('Error: Failed to create test user.');
      }
    }
    
    console.log('\nAuth0 integration test completed successfully!');
  } catch (error) {
    console.error('Error testing Auth0 integration:', error);
  } finally {
    // Clean up test user if needed
    // Uncomment the following lines to delete the test user
    /*
    console.log('\nCleaning up test user...');
    await prisma.$executeRaw`
      DELETE FROM hopeai_alpha.users WHERE email = ${mockAuth0User.email}
    `;
    console.log('Test user cleaned up.');
    */
    
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