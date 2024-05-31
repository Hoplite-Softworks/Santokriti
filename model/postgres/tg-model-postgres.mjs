'use strict';
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import pkg from 'pg';
import fs from 'fs';

const { Pool } = pkg; // get Pool from pg package

dotenv.config(); // load environment variables from .env file

// initialize connection pool using environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // environment variable (database connection string)
    //ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// connect to PostgreSQL database
export let connect = async () => {
    try {
        const client = await pool.connect(); // get client from the pool
        return client;
    } catch (error) {
        throw new Error('Unable to connect to the database: ' + error);
    }
}

// initialize database
export let initializeDatabase = async () => {
    try {
        const sql = fs.readFileSync('/model/postgres/create_tables.sql', 'utf8');
        await pool.query(sql);
        console.log('Database initialization complete.');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// populate database
export let populatePlaceAndOwnsTables = async () => {
    const placeCheckSql = `SELECT COUNT(*) FROM "Place"`;
    const insertPlaceSql = `
    INSERT INTO "Place" ("name", "lat", "lng", "markerImage", "keywords", "description") VALUES
    ('Chora Castle', 36.1400, 22.9975, '/images/chora_castle_1.jpg, /images/chora_castle_2.jpg, /images/chora_castle_3.jpg', 'castle,history,views', 'The Chora Castle in Kythira offers stunning views over the island and a deep dive into the history of Venetian rule.'),
    ('Kaladi Beach', 36.1801, 23.0361, '/images/kaladi_beach_1.jpg, /images/kaladi_beach_2.jpg, /images/kaladi_beach_3.jpg', 'beach,swimming,nature', 'Kaladi Beach is one of the most beautiful beaches in Kythira, known for its crystal clear waters and dramatic rock formations.'),
    ('Milopotamos Waterfall', 36.2305, 22.9902, '/images/milopotamos_waterfall_1.jpg, /images/milopotamos_waterfall_2.jpg, /images/milopotamos_waterfall_3.jpg', 'waterfall,nature,hiking', 'Milopotamos Waterfall is a serene natural attraction, perfect for hiking and enjoying the lush surroundings.'),
    ('Agia Pelagia', 36.2698, 23.0267, '/images/agia_pelagia_1.jpg, /images/agia_pelagia_2.jpg, /images/agia_pelagia_3.jpg', 'village,beach,relaxation', 'Agia Pelagia is a charming village with beautiful beaches and a relaxed atmosphere, ideal for a peaceful getaway.'),
    ('Kapsali Bay', 36.1432, 23.0078, '/images/kapsali_bay_1.jpg, /images/kapsali_bay_2.jpg, /images/kapsali_bay_3.jpg', 'bay,beach,nightlife', 'Kapsali Bay is known for its scenic beauty and vibrant nightlife, making it a popular destination for both relaxation and entertainment.'),
    ('Paleochora', 36.2063, 22.9817, '/images/paleochora_1.jpg, /images/paleochora_2.jpg, /images/paleochora_3.jpg', 'ruins,history,medieval', 'Paleochora is an ancient ruined city, offering a glimpse into the islands medieval past and stunning panoramic views.'),
    ('Avlemonas', 36.1809, 23.0818, '/images/avlemonas_1.jpg, /images/avlemonas_2.jpg, /images/avlemonas_3.jpg', 'village,swimming,architecture', 'Avlemonas is a picturesque village known for its charming architecture and inviting swimming spots.'),
    ('Fyri Ammos Beach', 36.2221, 23.0365, '/images/fyri_ammos_beach_1.jpg, /images/fyri_ammos_beach_2.jpg, /images/fyri_ammos_beach_3.jpg', 'beach,sand,swimming', 'Fyri Ammos Beach is a sandy beach perfect for swimming and sunbathing, offering a tranquil setting for relaxation.'),
    ('Katouni Bridge', 36.2321, 22.9967, '/images/katouni_bridge_1.jpg, /images/katouni_bridge_2.jpg, /images/katouni_bridge_3.jpg', 'bridge,architecture,history', 'Katouni Bridge is a historical stone bridge, an impressive feat of engineering from the British era on the island.'),
    ('Byzantine Museum', 36.1455, 23.0002, '/images/byzantine_museum_1.jpg, /images/byzantine_museum_2.jpg, /images/byzantine_museum_3.jpg', 'museum,history,culture', 'The Byzantine Museum in Kythira houses an impressive collection of artifacts, showcasing the islands rich cultural and religious history.');
    `;

    const insertOwnsSql = `
        INSERT INTO "Owns" ("userId", "placeId")
        SELECT 2, "placeId" FROM "Place"
    `;
    const params = [];
    try {
        const client = await connect();
        //await client.query(`TRUNCATE "Place", "Bookmark", "Owns" CASCADE;`, params);
        const res = await client.query(placeCheckSql, params);
        if (parseInt(res.rows[0].count, 10) === 0) {
            //await client
            //await client.query(insertPlaceSql, params); // insert to "Place" table
            //await client.query(insertOwnsSql, params); // insert to "Owns" table
            //await client.query(`INSERT INTO "Place"`, params);
            console.log('Place and Owns tables have been populated.');
        } else {
            console.log('Place table is not empty, skipping population.');
        }
        await client.release();
    } catch (error) {
        console.error('Error populating Place and Owns tables:', error);
    }
};

// get all info for all places
export let getAllPlaces = async () => {
    const sql = `
        SELECT * FROM "Place"
    `;
    const params = [];
    try {
        const client = await connect();
        //await initializeDatabase();
        //await populatePlaceAndOwnsTables(); // ensure tables are populated if empty

        const places = await client.query(sql, params);
        await client.release();
        return places.rows; // return the result
    } catch (err) {
        throw err; // throw the error to be handled by the caller
    }
}

// get all bookmarks for a given user with their associated place info
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
        return bookmarks.rows;
    } catch (err) {
        throw err;
    }
}

// get info of a specific place
export let getPlace = async (placeId) => {
    const sql = `
        SELECT * FROM "Place" WHERE "placeId" = $1
    `;
    const params = [placeId];
    try {
        const client = await connect();
        const place = await client.query(sql, params);
        await client.release();
        return place.rows[0];
    } catch (err) {
        throw err;
    }
}

// add a bookmark
export let addBookmark = async (userId, placeId) => {
    const bookmarkAlreadyExists = await bookmarkExists(userId, placeId);
    if (bookmarkAlreadyExists) {
        throw new Error('Bookmark already exists');
    }
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
        throw err;
    }
};

// remove a bookmark
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
        throw err;
    }
}

// get a user's info given his email
export let getUserByEmail = async (email) => {
    const sql = `
        SELECT "userId", "email", "password", "isShopKeeper" FROM "User" WHERE "email" = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const user = await client.query(sql, params);
        //await client.release();
        client.release();
        return user.rows[0];
    } catch (err) {
        throw err;
    }
}

// check if a user exists given his email
export let userExistsByEmail = async (email) => {
    const sql = `
        SELECT 1 FROM "User" WHERE "email" = $1 LIMIT 1
    `;
    const params = [email];
    try {
        const client = await connect();
        const result = await client.query(sql, params);
        await client.release();
        return !!result.rows.length; // return true if user exists
    } catch (err) {
        throw err;
    }
}

// register new user
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
            if (isShopKeeper == null || isShopKeeper == undefined) {
                isShopKeeper = 0;
            }
            const params = [name, email, hashedPassword, isShopKeeper];
            const client = await connect();
            const result = await client.query(sql, params);
            await client.release();
            return result.rows[0].userId; // return the new user's ID
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

export let bookmarkExists = async (userId, placeId) => {
    const sql = `
        SELECT 1 FROM "Bookmark" WHERE "userId" = $1 AND "placeId" = $2
    `;
    const params = [userId, placeId];
    try {
        const client = await connect();
        const result = await client.query(sql, params);
        await client.release();
        return !!result.rows.length;
    } catch (err) {
        throw err;
    }
};

export let popul = async (userId) => {
    if (userId == 2) {
        const client = await connect();
        const sql = fs.readFileSync('/model/postgres/populate_places_owns.sql', 'utf8');
        await client.query(sql, []);
        console.log('Database populated with new places.');
        await client.release();
        return true;
    }
}