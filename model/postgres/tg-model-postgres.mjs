"use strict";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

dotenv.config();

//const pool = new pg.Pool(); //οι παράμετροι ορίζονται ως μεταβλητές περιβάλλοντος
const pool = new Pool({
    connectionString: process.env.LOCAL_DATABASE_URL
    //connectionString: process.env.REMOTE_DATABASE_URL
});

export let connect = async () => {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        throw new Error("Unable to connect to the database:\n" + error);
    }
};


export let getAllPlaces = async () => {
    const sql = `
        SELECT p.place_id, p.name AS place_name, latitude, longitude, c.name AS category_name, k.keywords
        FROM places AS p
        LEFT JOIN (
            SELECT place_id, string_agg(keyword, ', ') AS keywords
            FROM place_keywords
            GROUP BY place_id
        ) AS k ON p.place_id = k.place_id
        JOIN categories AS c ON c.category_id = p.category_id
        WHERE p.date_removed IS NULL`;
    const params = [];
    try {
        const client = await connect();
        const places = await client.query(sql, params);
        client.release();
        return places.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

export let getAllCategories = async () => {
    const sql = `
        SELECT name FROM categories ORDER BY category_id
    `;
    const params = [];
    try {
        const client = await connect();
        const categories = await client.query(sql, params);
        client.release();
        return categories.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};


export let getPlace = async (placeId) => {
    const sql = `
        SELECT * FROM places WHERE place_id = $1
    `;
    const params = [placeId];
    try {
        const client = await connect();
        const place = await client.query(sql, params);
        client.release();
        return place.rows[0]; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};


/*export let bookmarkExists = async (userId, placeId) => {
    const sql = `
        SELECT 1 FROM bookmarks WHERE "user_id" = $1 AND "place_id" = $2
    `;
    const params = [userId, placeId];
    try {
        const client = await connect();
        const result = await client.query(sql, params);
        client.release();
        return !!result.rows.length; // Return true if bookmark exists
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};*/

export let getAllBookmarksByUser = async (userId) => {
    const sql = `
    SELECT p.name, p.description, b.date_added, k.keywords
    FROM bookmarks AS b
    JOIN places AS p ON (b.place_id = p.place_id AND b.date_removed IS NULL AND p.date_removed IS NULL)
    LEFT JOIN (
        SELECT place_id, string_agg(keyword, ', ') AS keywords
        FROM place_keywords
        GROUP BY place_id
    ) AS k ON p.place_id = k.place_id
    WHERE b.user_id = $1;
    `;
    const params = [userId];
    try {
        const client = await connect();
        const bookmarks = await client.query(sql, params);
        client.release();
        return bookmarks.rows; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

export let addBookmark = async (userId, placeId) => {
    /*const bookmarkAlreadyExists = await bookmarkExists(userId, placeId);
    if (bookmarkAlreadyExists) {
        throw new Error("Bookmark already exists");
    }*/
    const sql = `
        INSERT INTO bookmarks (date_added, user_id, place_id)
        VALUES (CURRENT_DATE, $1, $2)
    `;
    const params = [userId, placeId];
    try {
        const client = await connect();
        await client.query(sql, params);
        client.release();
        return true;
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};


export let removeBookmark = async (placeId, userId) => {
    const sql = `
        UPDATE bookmarks SET date_removed = CURRENT_DATE WHERE (place_id = $1 AND user_id = $2)
    `;
    const params = [placeId, userId];
    try {
        const client = await connect();
        await client.query(sql, params);
        client.release();
        return true;
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

export let getUserByEmail = async (email) => {
    const sql = `
        SELECT user_id, email, password FROM users WHERE email = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const user = await client.query(sql, params);
        client.release();
        return user.rows[0]; // Return the result
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

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
};

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
};

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
};
