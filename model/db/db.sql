CREATE TABLE IF NOT EXISTS "User" (
	"userId" INTEGER PRIMARY KEY AUTOINCREMENT,
	"name" STRING,
	"email" STRING UNIQUE,
	"password" STRING,
	"isShopKeeper" BINARY
);

CREATE TABLE IF NOT EXISTS "Place" (
	"placeId" INTEGER PRIMARY KEY AUTOINCREMENT,
	"name" STRING,
	"location" STRING,
	"description" TEXT,
	"photosDir" STRING
);

CREATE TABLE IF NOT EXISTS "Bookmark" (
	"bookmarkId" INTEGER PRIMARY KEY AUTOINCREMENT,
	"date" DATETIME,
	"userId" INTEGER,
	"placeId" INTEGER,
	FOREIGN KEY ("userId") REFERENCES "User" ("userId")
            ON UPDATE CASCADE
            ON DELETE CASCADE,
	FOREIGN KEY ("placeId") REFERENCES "Place" ("placeId")
            ON UPDATE CASCADE
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Owns" (
	"userId" INTEGER,
	"placeId" INTEGER,
	FOREIGN KEY ("userId") REFERENCES "User" ("userId")
            ON UPDATE CASCADE
            ON DELETE SET NULL,
	FOREIGN KEY ("placeId") REFERENCES "Place" ("placeId")
            ON UPDATE CASCADE
            ON DELETE SET NULL
);