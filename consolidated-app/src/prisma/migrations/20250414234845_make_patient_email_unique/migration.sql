/*
  Warnings:

  - A unique constraint covering the columns `[contactEmail]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contactEmail` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "contactEmail" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_contactEmail_key" ON "Patient"("contactEmail");
