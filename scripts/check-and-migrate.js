const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Checking if DSM5Criteria table exists...');
  
  try {
    // Try to query the DSM5Criteria table
    await prisma.dSM5Criteria.findFirst();
    console.log('DSM5Criteria table exists. No migration needed.');
  } catch (error) {
    // If the table doesn't exist, run the migration
    if (error.message.includes('does not exist') || error.code === 'P2010') {
      console.log('DSM5Criteria table does not exist. Running migration...');
      
      try {
        // Create the migration file
        const migrationDir = path.join(__dirname, '../prisma/migrations/add_dsm5_criteria');
        
        // Create the migration directory if it doesn't exist
        const fs = require('fs');
        if (!fs.existsSync(migrationDir)) {
          fs.mkdirSync(migrationDir, { recursive: true });
        }
        
        // Create the migration file
        const migrationFile = path.join(migrationDir, 'migration.sql');
        fs.writeFileSync(migrationFile, `
-- CreateTable
CREATE TABLE "DSM5Criteria" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icdEquivalent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DSM5Criteria_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "AssessmentDSM5Criteria" (
    "assessmentId" UUID NOT NULL,
    "dsmCode" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "certaintyLevel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentDSM5Criteria_pkey" PRIMARY KEY ("assessmentId","dsmCode")
);

-- AddForeignKey
ALTER TABLE "AssessmentDSM5Criteria" ADD CONSTRAINT "AssessmentDSM5Criteria_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentDSM5Criteria" ADD CONSTRAINT "AssessmentDSM5Criteria_dsmCode_fkey" FOREIGN KEY ("dsmCode") REFERENCES "DSM5Criteria"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSM5Criteria" ADD CONSTRAINT "DSM5Criteria_icdEquivalent_fkey" FOREIGN KEY ("icdEquivalent") REFERENCES "ICDCriteria"("code") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        
        // Run the migration
        console.log('Applying migration...');
        execSync('npx prisma migrate dev --name add_dsm5_criteria', {
          stdio: 'inherit',
        });
        
        console.log('Migration completed successfully!');
      } catch (migrationError) {
        console.error('Error running migration:', migrationError);
        process.exit(1);
      }
    } else {
      console.error('Error checking DSM5Criteria table:', error);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
