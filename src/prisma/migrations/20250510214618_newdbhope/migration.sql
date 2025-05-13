/*
  Warnings:

  - You are about to drop the column `completed` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `appointmentId` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledFor` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "completed",
DROP COLUMN "description",
DROP COLUMN "dueDate",
DROP COLUMN "priority",
DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "appointmentId" UUID NOT NULL,
ADD COLUMN     "scheduledFor" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
