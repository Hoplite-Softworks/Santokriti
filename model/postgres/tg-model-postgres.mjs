"use strict";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";
import os from "os";

const { Pool } = pkg;

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
const pool = new Pool({
    connectionString: isDevelopment ? process.env.LOCAL_DATABASE_URL : process.env.REMOTE_DATABASE_URL
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
        SELECT p.place_id, p.name AS place_name, p.description, ph.photo_paths, k.keywords
        FROM places AS p
        LEFT JOIN (
            SELECT place_id, string_agg(keyword, ', ') AS keywords
            FROM place_keywords
            GROUP BY place_id
        ) AS k ON p.place_id = k.place_id
        LEFT JOIN (
            SELECT place_id, string_agg(photo_path, ', ') AS photo_paths
            FROM photos
            GROUP BY place_id
        ) AS ph ON p.place_id = ph.place_id
        WHERE p.date_removed IS NULL AND p.place_id = $1
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
    SELECT p.name AS place_name, p.description, b.date_added, k.keywords
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

export let sendUserMessage = async (message, userId) => {
    const sql = `
        INSERT INTO user_messages (content, date_sent, user_id) VALUES ($1, CURRENT_DATE, $2)
    `;
    const params = [message, userId];
    try {
        const client = await connect();
        await client.query(sql, params);
        client.release();
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

export let sendEmailMessage = async (message, email, firstName, lastName) => {
    const sql = `
        INSERT INTO email_messages (content, date_sent, email, first_name, last_name) VALUES ($1, CURRENT_DATE, $2, $3, $4)
    `;
    const params = [message, email, firstName, lastName];
    try {
        const client = await connect();
        await client.query(sql, params);
        client.release();
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
        SELECT 1 FROM users WHERE email = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const result = await client.query(sql, params);
        client.release();
        return !!result.rows.length; // Return true if user exists
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};

export let registerUser = async function (firstName, lastName, password, email, isShopKeeper, telephone) {
    const userExists = await userExistsByEmail(email);
    if (userExists) {
        return { message: "A user with this email already exists" };
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            var sql = ``
            if (isShopKeeper == 'on') {
                sql = `
                WITH inserted_user AS (
                INSERT INTO users ("first_name", "last_name", "password", "email")
                VALUES ($1, $2, $3, $4)
                RETURNING "user_id"
                )
                INSERT INTO owners ("telephone", "user_id")
                SELECT $5, "user_id"
                FROM inserted_user
                RETURNING "user_id";
                `
            } else {
                sql = `
                INSERT INTO users ("first_name", "last_name", "password", "email")
                VALUES ($1, $2, $3, $4)
                RETURNING "user_id"
            `;
            }
            
            const params = [firstName, lastName, password, email, telephone];
            const client = await connect();
            const result = await client.query(sql, params);
            client.release();
            return result.rows[0].user_id; // Return the new user's ID
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
