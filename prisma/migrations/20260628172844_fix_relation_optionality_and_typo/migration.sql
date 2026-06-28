/*
  Warnings:

  - You are about to drop the column `calenderEventId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "calenderEventId",
DROP COLUMN "userId",
ADD COLUMN     "calendarEventId" TEXT;
