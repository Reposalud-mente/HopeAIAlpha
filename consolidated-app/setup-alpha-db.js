const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const envFile = path.resolve(__dirname, '.env.alpha');
const schemaPath = path.resolve(__dirname, 'src/prisma/schema.prisma');
const alphaSeedPath = path.resolve(__dirname, 'src/prisma/alpha-seed.ts');

console.log('🚀 Starting Alpha Database Setup');
console.log('--------------------------------');

// Check if .env.alpha exists
if (!fs.existsSync(envFile)) {
  console.error('❌ Error: .env.alpha file not found!');
  console.log('Please create the .env.alpha file with your alpha database configuration.');
  process.exit(1);
}

try {
  // Step 1: Apply migrations to the alpha database
  console.log('📦 Applying database migrations...');
  execSync(`npx prisma migrate deploy --schema=${schemaPath} --env-file=${envFile}`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'alpha' }
  });
  console.log('✅ Migrations applied successfully!');

  // Step 2: Seed the alpha database with sanitized test data
  console.log('🌱 Seeding alpha database with sanitized test data...');
  execSync(`npx tsx ${alphaSeedPath}`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'alpha' }
  });
  console.log('✅ Alpha database seeded successfully!');

  console.log('');
  console.log('🎉 Alpha database setup completed!');
  console.log('');
  console.log('You can now start the application in alpha mode with:');
  console.log('NEXT_PUBLIC_APP_ENV=alpha pnpm run dev');
  console.log('');
  console.log('Or build for alpha deployment:');
  console.log('NEXT_PUBLIC_APP_ENV=alpha pnpm run build');

} catch (error) {
  console.error('❌ Error during alpha database setup:', error.message);
  process.exit(1);
}
