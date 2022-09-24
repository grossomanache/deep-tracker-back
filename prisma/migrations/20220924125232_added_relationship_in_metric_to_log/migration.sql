/*
  Warnings:

  - You are about to alter the column `value` on the `Metric` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Metric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "loggedById" INTEGER NOT NULL,
    CONSTRAINT "Metric_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "Log" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Metric" ("id", "loggedById", "name", "value") SELECT "id", "loggedById", "name", "value" FROM "Metric";
DROP TABLE "Metric";
ALTER TABLE "new_Metric" RENAME TO "Metric";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
