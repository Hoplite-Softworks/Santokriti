import express from "express";
const app = express();

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import i18n from "i18n";

import cookieParser from "cookie-parser";

i18n.configure({
    locales: ['en', 'el', 'es'], // List of supported languages
    directory: path.join(__dirname, 'locales'), // Path to locales directory
    defaultLocale: 'el', // Default language
    queryParameter: 'lang', // Query parameter to change language
    cookie: 'locale' // Cookie to store the language preference
});

app.use(cookieParser());

app.use(i18n.init);

import exphbs from "express-handlebars";

app.use(express.urlencoded({ extended: false }));

import tgSession from "./app-setup/app-setup-session.mjs";
app.use(tgSession);

app.use(express.static("public"));

app.use((req, res, next) => {
    if (req.session) {
        res.locals.userId = req.session.loggedUserId;
        res.locals.isShopKeeper = req.session.isShopKeeper;
    } else {
        res.locals.userId = "επισκέπτης";
        res.locals.isShopKeeper = 0;
    }
    next();
});

app.use((req, res, next) => {
    const lang = req.query.lang || req.cookies.locale || 'en';
    res.cookie('locale', lang, { maxAge: 900000, httpOnly: true });
    req.setLocale(lang);
    next();
 });

import routes from "./routes/tg-routes.mjs";
app.use("/", routes);

//Error Handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render("error", { message: err.message, stacktrace: err.stack });
});

//Χρήση των views
//Σημ.: η engine πρέπει να έχει ίδιο όνομα με το extname, αλλιώς δεν θα
//αναγνωριστεί το extname (αν δεν το κάνουμε αυτό, απλά τα αρχεία handlebars θα πρέπει να
///τελειώνουν με .handlebars)
app.engine(
    "hbs",
    exphbs.engine({
        extname: "hbs",
    })
);

//και ορίζουμε πως θα χρησιμοποιήσουμε τη μηχανή template με όνομα 'hbs'
app.set("view engine", "hbs");

export { app as tg };
