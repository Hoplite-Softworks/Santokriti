-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "userId" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "email" VARCHAR(255) UNIQUE,
    "password" VARCHAR(255),
    "isShopKeeper" BOOLEAN
);

-- Create Place table
CREATE TABLE IF NOT EXISTS "Place" (
    "placeId" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "markerImage" TEXT,
    "keywords" TEXT,
    "description" TEXT
);

-- Create Bookmark table
CREATE TABLE IF NOT EXISTS "Bookmark" (
    "bookmarkId" SERIAL PRIMARY KEY,
    "date" TIMESTAMP,
    "userId" INTEGER,
    "placeId" INTEGER,
    FOREIGN KEY ("userId") REFERENCES "User" ("userId")
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY ("placeId") REFERENCES "Place" ("placeId")
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Create Owns table
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