-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('CREATING', 'INSTALLING', 'CONFIGURING', 'READY', 'FAILED', 'DELETING');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "release" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'CREATING',
    "adminEmail" TEXT NOT NULL,
    "adminPassword" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_namespace_key" ON "Store"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "Store_release_key" ON "Store"("release");

-- CreateIndex
CREATE UNIQUE INDEX "Store_domain_key" ON "Store"("domain");
