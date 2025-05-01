// This is a CommonJS script to run the seed-reports.ts file
// It bypasses the ESM issues by using ts-node in CommonJS mode

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the original seed file
const seedFilePath = path.resolve(__dirname, '../prisma/seed-reports.ts');
// Path to a temporary copy we'll modify
const tempSeedFilePath = path.resolve(__dirname, '../prisma/seed-reports-temp.ts');

try {
  // Read the original file
  const originalContent = fs.readFileSync(seedFilePath, 'utf8');
  
  // Create a temporary file with CommonJS syntax
  fs.writeFileSync(tempSeedFilePath, originalContent);
  
  // Run the temporary file with ts-node in CommonJS mode
  console.log('Running seed-reports.ts with ts-node...');
  execSync(`npx ts-node --project tsconfig-seed.json -r dotenv/config ${tempSeedFilePath}`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('Seed completed successfully!');
} catch (error) {
  console.error('Error running seed:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempSeedFilePath)) {
    fs.unlinkSync(tempSeedFilePath);
  }
}
