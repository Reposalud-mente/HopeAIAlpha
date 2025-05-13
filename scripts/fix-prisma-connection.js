// Script to fix Prisma connection issues
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting Prisma connection fix script');
console.log('----------------------------------------');

// Step 1: Check the environment
console.log('📋 Checking environment...');
try {
  // Get the current working directory
  const cwd = process.cwd();
  console.log(`Current working directory: ${cwd}`);

  // Check if we're in the consolidated-app directory
  const isInConsolidatedApp = cwd.endsWith('consolidated-app');
  if (!isInConsolidatedApp) {
    console.warn('⚠️ Warning: You might not be in the consolidated-app directory.');
    console.log('Please run this script from the consolidated-app directory.');
  }

  // Check if .env file exists
  const envPath = path.join(cwd, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.log('Please create a .env file with your database configuration.');
    process.exit(1);
  }

  // Check if schema.prisma exists
  const schemaPath = path.join(cwd, 'src', 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: schema.prisma file not found!');
    console.log('Please ensure the Prisma schema file exists at src/prisma/schema.prisma.');
    process.exit(1);
  }

  console.log('✅ Environment check passed.');
} catch (error) {
  console.error('❌ Error checking environment:', error);
  process.exit(1);
}

// Step 2: Clean Prisma cache
console.log('\n🧹 Cleaning Prisma cache...');
try {
  // Remove the generated Prisma client
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaClientPath)) {
    console.log('Removing existing Prisma client...');
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
  }

  console.log('✅ Prisma cache cleaned.');
} catch (error) {
  console.error('❌ Error cleaning Prisma cache:', error);
  console.log('Continuing with the process...');
}

// Step 3: Verify database connection
console.log('\n🔍 Verifying database connection...');
try {
  console.log('Running database connection check...');
  execSync('npx prisma db pull --schema=src/prisma/schema.prisma', {
    stdio: 'inherit',
  });

  console.log('✅ Database connection verified.');
} catch (error) {
  console.error('❌ Error verifying database connection:', error);
  console.log('Please check your DATABASE_URL in the .env file.');
  process.exit(1);
}

// Step 4: Generate Prisma client
console.log('\n🔄 Generating Prisma client...');
try {
  console.log('Running prisma generate...');
  execSync('npx prisma generate --schema=src/prisma/schema.prisma', {
    stdio: 'inherit',
  });

  console.log('✅ Prisma client generated successfully.');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}

// Step 5: Apply any pending migrations
console.log('\n📦 Applying any pending migrations...');
try {
  console.log('Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy --schema=src/prisma/schema.prisma', {
    stdio: 'inherit',
  });

  console.log('✅ Migrations applied successfully.');
} catch (error) {
  console.error('❌ Error applying migrations:', error);
  process.exit(1);
}

console.log('\n🎉 Prisma connection fix completed!');
console.log('----------------------------------');
console.log('Please restart your application to apply the changes.');
console.log('Run: npm run dev');
