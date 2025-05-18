-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "cliente" JSONB NOT NULL,
    "shipping" JSONB NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
