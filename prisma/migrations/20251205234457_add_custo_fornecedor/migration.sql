-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "precoCusto" REAL NOT NULL DEFAULT 0,
    "estoque" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "fornecedor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("categoria", "createdAt", "estoque", "id", "nome", "preco") SELECT "categoria", "createdAt", "estoque", "id", "nome", "preco" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
