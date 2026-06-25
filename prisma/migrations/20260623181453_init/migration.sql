-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SUPERVISOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corId" TEXT,
    "eventName" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "venue" TEXT,
    "room" TEXT,
    "isRealEvent" BOOLEAN NOT NULL DEFAULT true,
    "numberOfParticipants" INTEGER NOT NULL DEFAULT 0,
    "numberOfCert" INTEGER NOT NULL DEFAULT 0,
    "certificatesZip" TEXT,
    "trainerName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    "trainerId" TEXT,
    CONSTRAINT "courses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("certificatesZip", "companyId", "corId", "courseName", "createdAt", "eventName", "id", "isRealEvent", "numberOfCert", "numberOfParticipants", "room", "startDate", "trainerName", "updatedAt", "venue") SELECT "certificatesZip", "companyId", "corId", "courseName", "createdAt", "eventName", "id", "isRealEvent", "numberOfCert", "numberOfParticipants", "room", "startDate", "trainerName", "updatedAt", "venue" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE UNIQUE INDEX "courses_corId_key" ON "courses"("corId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_name_key" ON "trainers"("name");
