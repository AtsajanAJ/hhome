-- CreateTable
CREATE TABLE "ReportAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportAttachment_reportId_idx" ON "ReportAttachment"("reportId");

-- CreateIndex
CREATE INDEX "ReportAttachment_userId_createdAt_idx" ON "ReportAttachment"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReportAttachment" ADD CONSTRAINT "ReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAttachment" ADD CONSTRAINT "ReportAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
