-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN "type" TEXT;

-- Update existing records to have a default type
UPDATE "Assessment" SET "type" = 'PSYCHOLOGICAL_EVALUATION' WHERE "type" IS NULL;

-- Make the column required after setting defaults
ALTER TABLE "Assessment" ALTER COLUMN "type" SET NOT NULL;
