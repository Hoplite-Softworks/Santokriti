'use strict';
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config();

//const pool = new pg.Pool(); //οι παράμετροι ορίζονται ως μεταβλητές περιβάλλοντος
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, //μεταβλητή περιβάλλοντος
    //ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

export let connect = async () => {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        throw new Error('Unable to connect to the database: ' + error);
    }
}

export let initializeDatabase = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../db/create_tables.sql'), 'utf8');
        await pool.query(sql);
        console.log('Database initialization complete.');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        // Close the database connection pool
        await pool.end();
    }
}

export let getAllPlaces = async () => {
    const sql = `
        SELECT * FROM "Place"
    `;
    const params = [];
    try {
        const client = await connect();
        await initializeDatabase();
        const places = await client.query(sql, params);
        await client.release();
        return places.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let getAllBookmarksWithPlaces = async (userId) => {
    const sql = `
        SELECT b."bookmarkId", b."date", b."userId", b."placeId", p."name" as "placeName", p."description"
        FROM "Bookmark" AS b
        JOIN "Place" AS p ON b."placeId" = p."placeId"
        WHERE b."userId" = $1
    `;
    const params = [userId];
    try {
        const client = await connect();
        const bookmarks = await client.query(sql, params);
        await client.release();
        return bookmarks.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let getPlace = async (placeId) => {
    const sql = `
        SELECT * FROM "Place" WHERE "placeId" = $1
    `;
    const params = [placeId];
    try {
        const client = await connect();
        const place = await client.query(sql, params);
        await client.release();
        return place.rows[0]; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let addBookmark = async (userId, placeId) => {
    const sql = `
        INSERT INTO "Bookmark" ("date", "userId", "placeId")
        VALUES (CURRENT_TIMESTAMP, $1, $2)
    `;
    const params = [userId, placeId];
    try {
        const client = await connect();
        await client.query(sql, params);
        await client.release();
        return true;
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let removeBookmark = async (placeId, userId) => {
    const sql = `
        DELETE FROM "Bookmark" WHERE "placeId" = $1 AND "userId" = $2
    `;
    const params = [placeId, userId];
    try {
        const client = await connect();
        await client.query(sql, params);
        await client.release();
        return true;
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let getUserByEmail = async (email) => {
    const sql = `
        SELECT "userId", "email", "password", "isShopKeeper" FROM "User" WHERE "email" = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const user = await client.query(sql, params);
        await client.release();
        return user.rows[0]; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let userExistsByEmail = async (email) => {
    const sql = `
        SELECT 1 FROM "User" WHERE "email" = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const result = await client.query(sql, params);
        await client.release();
        return !!result.rows.length; // Return true if user exists
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}

export let registerUser = async function (name, email, password, isShopKeeper) {
    const userExists = await userExistsByEmail(email);
    if (userExists) {
        return { message: "A user with this email already exists" };
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = `
                INSERT INTO "User" ("name", "email", "password", "isShopKeeper")
                VALUES ($1, $2, $3, $4)
                RETURNING "userId"
            `;
            const params = [name, email, hashedPassword, isShopKeeper];
            const client = await connect();
            const result = await client.query(sql, params);
            await client.release();
            return result.rows[0].userId; // Return the new user's ID
        } catch (error) {
            throw error;
        }
    }
}

export let getOwnedPlaces = async (userId) => {
    const sql = `
        SELECT p.*, COUNT(b."bookmarkId") AS "bookmarkCount"
        FROM "Place" p
        LEFT JOIN "Bookmark" b ON p."placeId" = b."placeId"
        JOIN "Owns" o ON p."placeId" = o."placeId"
        WHERE o."userId" = $1
        GROUP BY p."placeId"
    `;
    const params = [userId];
    try {
        const client = await connect();
        const places = await client.query(sql, params);
        await client.release();
        return places.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
}
