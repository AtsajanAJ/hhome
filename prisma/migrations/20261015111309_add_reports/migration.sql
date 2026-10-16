-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('CUSTOM', 'TASKS', 'INVENTORY');

-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('LOCAL', 'GOOGLE_DRIVE');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reportType" "ReportType" NOT NULL DEFAULT 'CUSTOM',
    "source" "ReportSource" NOT NULL DEFAULT 'LOCAL',
    "content" TEXT,
    "externalFileId" TEXT,
    "externalFileName" TEXT,
    "externalFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_userId_reportType_idx" ON "Report"("userId", "reportType");

-- CreateIndex
CREATE INDEX "Report_userId_source_idx" ON "Report"("userId", "source");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
