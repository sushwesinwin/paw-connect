-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('VET', 'GROOMER');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF_DUTY', 'ON_LEAVE');

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "specialty" TEXT NOT NULL,
    "availableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffMember_role_idx" ON "StaffMember"("role");

-- CreateIndex
CREATE INDEX "StaffMember_status_idx" ON "StaffMember"("status");
