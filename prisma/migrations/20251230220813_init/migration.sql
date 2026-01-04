-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageDataUrl" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "navItems" INTEGER NOT NULL,
    "ctaCount" INTEGER NOT NULL,
    "formFields" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "topFixes" JSONB NOT NULL,
    "laws" JSONB NOT NULL
);
