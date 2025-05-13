-- First, check if the Appointment table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Appointment') THEN
        -- If the table exists, check if endTime column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'endTime') THEN
            -- Add endTime column if it doesn't exist
            ALTER TABLE "Appointment" ADD COLUMN "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        -- Check and add other columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'title') THEN
            ALTER TABLE "Appointment" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Consulta';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'duration') THEN
            ALTER TABLE "Appointment" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 60;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'location') THEN
            ALTER TABLE "Appointment" ADD COLUMN "location" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'isRecurring') THEN
            ALTER TABLE "Appointment" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'recurrencePattern') THEN
            ALTER TABLE "Appointment" ADD COLUMN "recurrencePattern" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'recurrenceEndDate') THEN
            ALTER TABLE "Appointment" ADD COLUMN "recurrenceEndDate" TIMESTAMP(3);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'parentAppointmentId') THEN
            ALTER TABLE "Appointment" ADD COLUMN "parentAppointmentId" UUID;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'reminderSent') THEN
            ALTER TABLE "Appointment" ADD COLUMN "reminderSent" BOOLEAN NOT NULL DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'notificationPreference') THEN
            ALTER TABLE "Appointment" ADD COLUMN "notificationPreference" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'colorCode') THEN
            ALTER TABLE "Appointment" ADD COLUMN "colorCode" TEXT;
        END IF;
        
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
    ELSE
        -- If the table doesn't exist, create it with all required columns
        CREATE TABLE "Appointment" (
            "id" UUID NOT NULL,
            "patientId" UUID NOT NULL,
            "userId" UUID NOT NULL,
            "date" TIMESTAMP(3) NOT NULL,
            "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "title" TEXT NOT NULL DEFAULT 'Consulta',
            "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
        
        -- Add foreign key constraints
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" 
        FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentAppointmentId_fkey" 
        FOREIGN KEY ("parentAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create the Reminder model if it doesn't exist
CREATE TABLE IF NOT EXISTS "Reminder" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for Reminder if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'Reminder' 
        AND ccu.column_name = 'appointmentId'
    ) THEN
        ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_appointmentId_fkey" 
        FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
