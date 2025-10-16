/*
  Warnings:

  - You are about to drop the column `lecturerId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_lecturerId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "lecturerId";

-- CreateTable
CREATE TABLE "_TaughtCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaughtCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaughtCourses_B_index" ON "_TaughtCourses"("B");

-- AddForeignKey
ALTER TABLE "_TaughtCourses" ADD CONSTRAINT "_TaughtCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaughtCourses" ADD CONSTRAINT "_TaughtCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
