-- This migration fixes the issue with missing tables
-- First, check if the Appointment table exists and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Appointment') THEN
        CREATE TABLE "Appointment" (
            "id" UUID NOT NULL,
            "patientId" UUID NOT NULL,
            "userId" UUID NOT NULL,
            "date" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "endTime" TIMESTAMP(3) NOT NULL,
            "title" TEXT NOT NULL DEFAULT 'Consulta',
            "duration" INTEGER NOT NULL DEFAULT 60,
            "location" TEXT,
            "isRecurring" BOOLEAN NOT NULL DEFAULT false,
            "recurrencePattern" TEXT,
            "recurrenceEndDate" TIMESTAMP(3),
            "parentAppointmentId" UUID,
            "reminderSent" BOOLEAN NOT NULL DEFAULT false,
            "notificationPreference" TEXT,
            "colorCode" TEXT,
            CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
        );

        -- Add foreign keys
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentAppointmentId_fkey" FOREIGN KEY ("parentAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Check if the Message table exists and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Message') THEN
        CREATE TABLE "Message" (
            "id" UUID NOT NULL,
            "patientId" UUID NOT NULL,
            "userId" UUID NOT NULL,
            "content" TEXT NOT NULL,
            "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "read" BOOLEAN NOT NULL DEFAULT false,
            CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
        );

        -- Add foreign keys
        ALTER TABLE "Message" ADD CONSTRAINT "Message_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Check if the Reminder table exists and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Reminder') THEN
        CREATE TABLE "Reminder" (
            "id" UUID NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "appointmentId" UUID NOT NULL,
            "scheduledFor" TIMESTAMP(3) NOT NULL,
            "sentAt" TIMESTAMP(3),
            "status" TEXT NOT NULL DEFAULT 'pending',
            "type" TEXT NOT NULL,
            CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
        );

        -- Add foreign keys
        ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Ensure the AppointmentStatus enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AppointmentStatus') THEN
        CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
    END IF;
END $$;

-- Update the Appointment table to use the enum if it's not already using it
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'status' AND data_type = 'text') THEN
        -- Create a temporary column with the enum type
        ALTER TABLE "Appointment" ADD COLUMN "status_enum" "AppointmentStatus";
        
        -- Update the temporary column based on the text values
        UPDATE "Appointment" SET "status_enum" = 
            CASE 
                WHEN "status" = 'SCHEDULED' THEN 'SCHEDULED'::"AppointmentStatus"
                WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"AppointmentStatus"
                WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"AppointmentStatus"
                WHEN "status" = 'NO_SHOW' THEN 'NO_SHOW'::"AppointmentStatus"
                ELSE 'SCHEDULED'::"AppointmentStatus"
            END;
        
        -- Drop the old column and rename the new one
        ALTER TABLE "Appointment" DROP COLUMN "status";
        ALTER TABLE "Appointment" RENAME COLUMN "status_enum" TO "status";
    END IF;
END $$;
