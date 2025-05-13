-- AlterTable
DO $$
BEGIN
    -- Check if endTime column exists before trying to alter it
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Appointment' AND column_name = 'endTime'
    ) THEN
        ALTER TABLE "Appointment" ALTER COLUMN "endTime" DROP DEFAULT;
    ELSE
        -- If endTime doesn't exist, add it without a default
        ALTER TABLE "Appointment" ADD COLUMN "endTime" TIMESTAMP(3) NOT NULL;
    END IF;
END $$;
