-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCENT', 'STUDENT', 'CURSIST');

-- CreateEnum
CREATE TYPE "ReadingLevel" AS ENUM ('2F', '3F', '3F+');

-- CreateEnum
CREATE TYPE "LengthPreference" AS ENUM ('KORT', 'MIDDEL', 'LANG');

-- CreateEnum
CREATE TYPE "ReadingGoal" AS ENUM ('ONTSPANNING', 'TAAL_OEFENEN', 'INFORMATIE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_list_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readingLevel" "ReadingLevel" NOT NULL,
    "genres" TEXT[],
    "topics" TEXT[],
    "lengthPref" "LengthPreference" NOT NULL,
    "readingGoal" "ReadingGoal" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "reading_list_items_userId_idx" ON "reading_list_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_list_items_userId_bookId_key" ON "reading_list_items"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_profiles_userId_key" ON "reading_profiles"("userId");

-- AddForeignKey
ALTER TABLE "reading_list_items" ADD CONSTRAINT "reading_list_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_profiles" ADD CONSTRAINT "reading_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
