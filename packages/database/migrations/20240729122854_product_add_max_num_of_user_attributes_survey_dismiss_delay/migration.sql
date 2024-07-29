-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maxNumOfUserAttributes" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "surveyDismissDelay" INTEGER NOT NULL DEFAULT 5;
