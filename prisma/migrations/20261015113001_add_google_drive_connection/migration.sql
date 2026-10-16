-- CreateTable
CREATE TABLE "GoogleDriveConnection" (
    "id" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GoogleDriveConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveConnection_userId_key" ON "GoogleDriveConnection"("userId");

-- AddForeignKey
ALTER TABLE "GoogleDriveConnection" ADD CONSTRAINT "GoogleDriveConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
