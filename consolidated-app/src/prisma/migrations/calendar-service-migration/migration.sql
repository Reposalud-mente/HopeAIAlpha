-- AlterTable
ALTER TABLE "Appointment" 
ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Consulta',
ADD COLUMN "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "location" TEXT,
ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recurrencePattern" TEXT,
ADD COLUMN "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN "parentAppointmentId" UUID,
ADD COLUMN "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notificationPreference" TEXT,
ADD COLUMN "colorCode" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentAppointmentId_fkey" FOREIGN KEY ("parentAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing appointments to set endTime based on date + 1 hour
UPDATE "Appointment" SET "endTime" = "date" + interval '1 hour' WHERE "endTime" = CURRENT_TIMESTAMP;