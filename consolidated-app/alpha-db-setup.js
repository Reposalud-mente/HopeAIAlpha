// This script sets up the alpha database by running migrations and seeding

// Set environment variables for alpha environment
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_APP_ENV = 'alpha';

// Load environment variables from .env.alpha
require('dotenv').config({ path: '.env.alpha' });

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Starting Alpha Database Setup');
  console.log('----------------------------');
  
  try {
    // Verify database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Successfully connected to the alpha database');
    await prisma.$disconnect();
    
    // Run migrations
    console.log('\nRunning database migrations...');
    execSync('npx prisma migrate deploy --schema=./src/prisma/schema.prisma', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
    
    // Run the alpha seed script
    console.log('\nSeeding the alpha database...');
    execSync('npx tsx src/prisma/alpha-seed.ts', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
    
    console.log('\n🎉 Alpha database setup completed!');
  } catch (error) {
    console.error('❌ Error setting up alpha database:', error);
    process.exit(1);
  }
}

main();
