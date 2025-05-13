/**
 * Script to update auth imports in all files
 * This script replaces NextAuth imports with our session adapter
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Determine the base directory (consolidated-app)
const baseDir = path.resolve(__dirname, '..');
console.log(`Base directory: ${baseDir}`);

// Files to update
const filesToUpdate = [
  // API Routes
  'src/app/api/sessions/[id]/export.ts',
  'src/app/api/sessions/[id]/import.ts',
  'src/app/api/sessions/route.ts',
  'src/app/api/sessions/[id]/ai-suggestions/route.ts',
  'src/app/api/sessions/[id]/route.ts',
  'src/app/api/patients/[id]/sessions/route.ts',
  'src/app/api/sessions/[id]/transfer/route.ts',
  'src/app/api/ai-tools/route.ts',
  'src/app/api/consultas-ai/route.ts',
  'src/app/api/test-pdf-parse/route.ts',
  'src/app/api/dsm5-retrieval/route.ts',
  'src/app/api/feedback/route.ts',

  // AI Assistant
  'src/lib/ai-assistant/context-gatherer.ts',
  'src/lib/ai-assistant/admin-tools.ts',

  // Additional files that might use NextAuth
  'src/lib/services/session-service.ts',
  'src/lib/services/patient-service.ts',
  'src/lib/services/user-service.ts',
  'src/app/api/patients/route.ts',
  'src/app/api/patients/[id]/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/reports/route.ts',
  'src/app/api/reports/[id]/route.ts'
];

// Patterns to replace
const patterns = [
  {
    find: /import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth['"]/g,
    replace: "import { getServerSession } from '@/lib/auth/session-adapter'"
  },
  {
    find: /import\s+{\s*authOptions\s*}\s+from\s+['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/authOptions['"]/g,
    replace: "import { authOptions } from '@/lib/auth/session-adapter'"
  },
  {
    find: /import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth['"][\s\S]*?import\s+{\s*authOptions\s*}\s+from\s+['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/authOptions['"]/g,
    replace: "import { getServerSession, authOptions } from '@/lib/auth/session-adapter'"
  }
];

// Function removed as it's no longer used

async function main() {
  console.log('Updating auth imports...');
  console.log(`Found ${filesToUpdate.length} files to process`);

  let updatedCount = 0;
  let notFoundCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;

  for (const file of filesToUpdate) {
    try {
      const fullPath = path.join(baseDir, file);
      if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${file}`);
        notFoundCount++;
        continue;
      }

      let content = await readFile(fullPath, 'utf8');
      let updated = false;

      // Apply each pattern
      for (const pattern of patterns) {
        if (pattern.find.test(content)) {
          content = content.replace(pattern.find, pattern.replace);
          updated = true;
        }
      }

      // Write the file if it was updated
      if (updated) {
        await writeFile(fullPath, content, 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
      } else {
        console.log(`No changes needed: ${file}`);
        unchangedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      errorCount++;
    }
  }

  console.log('\nSummary:');
  console.log(`Total files: ${filesToUpdate.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`No changes needed: ${unchangedCount}`);
  console.log(`Not found: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('\nDone!');
}

main().catch(error => {
  console.error('Script failed with error:', error);
  process.exit(1);
});
