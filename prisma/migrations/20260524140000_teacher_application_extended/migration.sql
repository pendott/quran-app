-- CreateEnum
CREATE TYPE "IdDocumentType" AS ENUM ('IC', 'PASSPORT');

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "idDocumentType" "IdDocumentType",
ADD COLUMN     "idDocumentNumber" TEXT,
ADD COLUMN     "studentLevels" JSONB,
ADD COLUMN     "certificationPath" TEXT,
ADD COLUMN     "maxStudentsPerWeek" INTEGER;

-- AlterTable
ALTER TABLE "TeacherApplication" ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "idDocumentType" "IdDocumentType",
ADD COLUMN     "idDocumentNumber" TEXT,
ADD COLUMN     "certificationPath" TEXT,
ADD COLUMN     "studentLevels" JSONB,
ADD COLUMN     "maxStudentsPerWeek" INTEGER,
ADD COLUMN     "heardFrom" TEXT,
ADD COLUMN     "heardFromOther" TEXT,
ADD COLUMN     "confirmedAccurate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmedCodeOfConduct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentBackgroundCheck" BOOLEAN NOT NULL DEFAULT false;

-- Backfill required columns for any existing rows (none expected in pilot)
UPDATE "TeacherApplication" SET
  "legalName" = "name",
  "idDocumentType" = 'IC',
  "idDocumentNumber" = 'LEGACY',
  "studentLevels" = '[]'::jsonb,
  "maxStudentsPerWeek" = 10,
  "heardFrom" = 'other',
  "confirmedAccurate" = true,
  "confirmedCodeOfConduct" = true,
  "consentBackgroundCheck" = false
WHERE "legalName" IS NULL;

ALTER TABLE "TeacherApplication" ALTER COLUMN "legalName" SET NOT NULL;
ALTER TABLE "TeacherApplication" ALTER COLUMN "idDocumentType" SET NOT NULL;
ALTER TABLE "TeacherApplication" ALTER COLUMN "idDocumentNumber" SET NOT NULL;
ALTER TABLE "TeacherApplication" ALTER COLUMN "studentLevels" SET NOT NULL;
ALTER TABLE "TeacherApplication" ALTER COLUMN "maxStudentsPerWeek" SET NOT NULL;
ALTER TABLE "TeacherApplication" ALTER COLUMN "heardFrom" SET NOT NULL;
