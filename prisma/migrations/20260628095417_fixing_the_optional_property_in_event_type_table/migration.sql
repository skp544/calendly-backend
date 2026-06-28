/*
  Warnings:

  - Made the column `durationMinutes` on table `event_types` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "event_types" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "durationMinutes" SET NOT NULL;
