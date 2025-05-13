/**
 * Generate Prisma Client Script
 * 
 * This script generates the Prisma client from the schema.prisma file.
 * It's used to ensure the client is up-to-date with the schema.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.resolve(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

// Check if schema.prisma exists
if (!fs.existsSync(schemaPath)) {
  console.error('Error: schema.prisma not found in the prisma directory.');
  console.log('Checking for schema.prisma.alpha...');
  
  const alphaSchemaPath = path.join(rootDir, 'schema.prisma.alpha');
  if (fs.existsSync(alphaSchemaPath)) {
    console.log('Found schema.prisma.alpha. Copying to prisma/schema.prisma...');
    
    // Ensure prisma directory exists
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }
    
    // Copy the alpha schema to the prisma directory
    fs.copyFileSync(alphaSchemaPath, schemaPath);
    console.log('Copied schema.prisma.alpha to prisma/schema.prisma.');
  } else {
    console.error('Error: No schema file found. Please create a schema.prisma file in the prisma directory.');
    process.exit(1);
  }
}

// Generate the Prisma client
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully.');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
  process.exit(1);
}