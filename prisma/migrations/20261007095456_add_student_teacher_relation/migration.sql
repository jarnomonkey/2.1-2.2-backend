-- AlterTable
ALTER TABLE "users" ADD COLUMN     "teacherId" TEXT;

-- CreateIndex
CREATE INDEX "users_teacherId_idx" ON "users"("teacherId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
