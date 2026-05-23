-- CreateEnum
CREATE TYPE "TeacherApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "teachingSubjects" JSONB,
ADD COLUMN     "languages" JSONB;

-- CreateTable
CREATE TABLE "TeacherApplication" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER NOT NULL,
    "qualifications" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "about" TEXT NOT NULL,
    "photoPath" TEXT,
    "teachingSubjects" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "proposedAvailability" JSONB NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
    "status" "TeacherApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "rejectionReason" TEXT,
    "createdTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherApplication_createdTeacherId_key" ON "TeacherApplication"("createdTeacherId");

-- CreateIndex
CREATE INDEX "TeacherApplication_status_createdAt_idx" ON "TeacherApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherApplication_email_idx" ON "TeacherApplication"("email");

-- AddForeignKey
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_createdTeacherId_fkey" FOREIGN KEY ("createdTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
