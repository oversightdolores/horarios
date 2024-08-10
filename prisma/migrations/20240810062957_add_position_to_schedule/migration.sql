-- CreateEnum
CREATE TYPE "Position" AS ENUM ('playa', 'shop');

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "position" "Position" NOT NULL DEFAULT 'playa';
