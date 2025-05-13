// Script to reset the Prisma client
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Starting Prisma client reset script');
console.log('-------------------------------------');

// Step 1: Delete the Prisma client
console.log('🗑️ Deleting Prisma client...');
try {
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaClientPath)) {
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
    console.log('✅ Prisma client deleted.');
  } else {
    console.log('⚠️ Prisma client directory not found. Continuing...');
  }
} catch (error) {
  console.error('❌ Error deleting Prisma client:', error);
  console.log('Continuing with the process...');
}

// Step 2: Delete the node_modules/.pnpm/@prisma directory
console.log('\n🗑️ Deleting pnpm Prisma cache...');
try {
  const prismaPnpmPath = path.join(process.cwd(), 'node_modules', '.pnpm', '@prisma');
  if (fs.existsSync(prismaPnpmPath)) {
    fs.rmSync(prismaPnpmPath, { recursive: true, force: true });
    console.log('✅ pnpm Prisma cache deleted.');
  } else {
    console.log('⚠️ pnpm Prisma cache directory not found. Continuing...');
  }
} catch (error) {
  console.error('❌ Error deleting pnpm Prisma cache:', error);
  console.log('Continuing with the process...');
}

// Step 3: Reinstall dependencies
console.log('\n📦 Reinstalling dependencies...');
try {
  console.log('Running pnpm install...');
  execSync('pnpm install', {
    stdio: 'inherit',
  });
  console.log('✅ Dependencies reinstalled.');
} catch (error) {
  console.error('❌ Error reinstalling dependencies:', error);
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

console.log('\n🎉 Prisma client reset completed!');
console.log('--------------------------------');
console.log('Please restart your application to apply the changes.');
console.log('Run: npm run dev');
