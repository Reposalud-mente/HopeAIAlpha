-- AlterTable
DO $$
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'title') THEN
        ALTER TABLE "Appointment" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Consulta';
    END IF;

    -- Add endTime column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'endTime') THEN
        ALTER TABLE "Appointment" ADD COLUMN "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add duration column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'duration') THEN
        ALTER TABLE "Appointment" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 60;
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'location') THEN
        ALTER TABLE "Appointment" ADD COLUMN "location" TEXT;
    END IF;

    -- Add isRecurring column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'isRecurring') THEN
        ALTER TABLE "Appointment" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add recurrencePattern column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'recurrencePattern') THEN
        ALTER TABLE "Appointment" ADD COLUMN "recurrencePattern" TEXT;
    END IF;

    -- Add recurrenceEndDate column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'recurrenceEndDate') THEN
        ALTER TABLE "Appointment" ADD COLUMN "recurrenceEndDate" TIMESTAMP(3);
    END IF;

    -- Add parentAppointmentId column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'parentAppointmentId') THEN
        ALTER TABLE "Appointment" ADD COLUMN "parentAppointmentId" UUID;
    END IF;

    -- Add reminderSent column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'reminderSent') THEN
        ALTER TABLE "Appointment" ADD COLUMN "reminderSent" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add notificationPreference column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'notificationPreference') THEN
        ALTER TABLE "Appointment" ADD COLUMN "notificationPreference" TEXT;
    END IF;

    -- Add colorCode column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'colorCode') THEN
        ALTER TABLE "Appointment" ADD COLUMN "colorCode" TEXT;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'Appointment'
        AND ccu.column_name = 'parentAppointmentId'
    ) THEN
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentAppointmentId_fkey"
        FOREIGN KEY ("parentAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Update existing appointments to set endTime based on date + 1 hour
DO $$
BEGIN
    -- Only update if endTime column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'endTime') THEN
        UPDATE "Appointment" SET "endTime" = "date" + interval '1 hour'
        WHERE "endTime" = CURRENT_TIMESTAMP AND "date" IS NOT NULL;
    END IF;
END $$;