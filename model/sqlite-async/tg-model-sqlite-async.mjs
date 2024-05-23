'use strict';
import { Database } from 'sqlite-async';
import bcrypt from 'bcrypt'

let sql;
try {
    sql = await Database.open('model/db/tg.db');
} catch (error) {
    throw Error('Δεν ήταν δυνατό να ανοίξει η βάση δεδομένων.' + error);
}

export let getAllPlaces = async () => {
    try {
        const stmt = await sql.prepare("SELECT * FROM Place");
        const places = await stmt.all();
        return places;
    } catch (err) {
        throw err;
    }
}

//export let getAllBookmarks = async (userId) => {
    //const stmt = await sql.prepare("SELECT * FROM Bookmark WHERE userId = ?");
    //try {
        //const bookmarks = await stmt.all(userId);
        //return bookmarks;
    //} catch (err) {
        //throw err;
    //}
//}

export let getAllBookmarksWithPlaces = async (userId) => {
    const stmt = await sql.prepare(`
        SELECT b.bookmarkId, b.date, b.userId, b.placeId, p.name as placeName, p.location, p.description
        FROM Bookmark AS b
        JOIN Place AS p ON b.placeId = p.placeId
        WHERE b.userId = ?
    `);
    try {
        const bookmarks = await stmt.all(userId);
        return bookmarks;
    } catch (err) {
        throw err;
    }
}

export let getPlace = async (placeId) => {
    const stmt = await sql.prepare("SELECT * FROM Place WHERE placeId = ? LIMIT 0, 1");
    try {
        const place = await stmt.all(placeId);
        return place;
    } catch (err) {
        throw err;
    }
}

export let addBookmark = async (userId, placeId) => {
    const stmt = await sql.prepare('INSERT INTO Bookmark VALUES (null, CURRENT_TIMESTAMP, ?, ?)');
    try {
        await stmt.run(userId, placeId);
        return true;
    }
    catch (err) {
        throw err;
    }
}

//Αλλαγή της κατάστασης μιας εργασίας
//export let toggleTask = async (taskId, userId) => {
    //Αν η εγγραφή με id ίσο με taskId έχει status=0 τότε κάντο 1, αλλιώς κάντο 0
    //const stmt = await sql.prepare('UPDATE task SET status = CASE WHEN status = 0 THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?');
    //try {
        //await stmt.run(taskId, userId);
        //return true
    //}
    //catch (err) {
        //throw err;
    //}
//}

export let removeBookmark = async (placeId, userId) => {
    const stmt = await sql.prepare("DELETE FROM Bookmark WHERE placeId = ? AND userId = ?");
    try {
        await stmt.run(placeId, userId);
        return true;
    }
    catch (err) {
        throw err;
    }
}

export let getUserByEmail = async (email) => {
    const stmt = await sql.prepare("SELECT userId, email, password FROM User WHERE email = ? LIMIT 0, 1");
    try {
        const user = await stmt.all(email);
        return user[0];
    } catch (err) {
        throw err;
    }
}

export let userExistsByEmail = async (email) => {
    const stmt = await sql.prepare("SELECT 1 FROM User WHERE email = ? LIMIT 1");
    try {
        const result = await stmt.get(email);
        return !!result;
    } catch (err) {
        throw err;
    }
}

export let registerUser = async function (name, email, password, isShopKeeper) {
    const userExists = userExistsByEmail(email);
    if (userExists) {
        return { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" };
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const stmt = await sql.prepare('INSERT INTO User VALUES (null, ?, ?, ?, ?)');
            const info = await stmt.run(name, email, password, isShopKeeper);
            return info.lastID;
        } catch (error) {
            throw error;
        }
    }
}