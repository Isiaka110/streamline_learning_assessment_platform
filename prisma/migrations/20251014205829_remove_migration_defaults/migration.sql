/*
  Warnings:

  - A unique constraint covering the columns `[code,semester,year]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Course_code_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semester" TEXT,
ADD COLUMN     "year" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_semester_year_key" ON "Course"("code", "semester", "year");
