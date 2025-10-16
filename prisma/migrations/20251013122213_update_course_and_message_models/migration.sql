-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_courseId_fkey";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "targetRole" "UserRole";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "courseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "type" "ResourceType" NOT NULL DEFAULT 'DOCUMENT';

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
