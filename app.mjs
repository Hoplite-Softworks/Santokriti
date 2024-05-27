import express from 'express'
const app = express()

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
    defaultLocale: 'en', // Default language
    queryParameter: 'lang', // Query parameter to change language
    cookie: 'locale' // Cookie to store the language preference
});

app.use(cookieParser());

app.use(i18n.init);

import exphbs from 'express-handlebars'

// handle POST requests
app.use(express.urlencoded({ extended: false }));

import tgSession from './app-setup/app-setup-session.mjs';
// enable session
app.use(tgSession);

// load public folder for templates etc
app.use(express.static('public'))

// session info
app.use((req, res, next) => {
   if (req.session) {
      res.locals.userId = req.session.loggedUserId;
      res.locals.isShopKeeper = req.session.isShopKeeper;
   } else {
      res.locals.userId = 'επισκέπτης';
      res.locals.isShopKeeper = 0;
   }
   next();
});

// locale info
app.use((req, res, next) => {
   const lang = req.query.lang || req.cookies.locale || 'en';
   res.cookie('locale', lang, { maxAge: 900000, httpOnly: true });
   req.setLocale(lang);
   next();
});

// routes
import routes from './routes/tg-routes.mjs';
app.use('/', routes);

// error Handler
app.use((err, req, res, next) => {
   if (res.headersSent) {
      return next(err);
   }
   res.status(500);
   res.render('error', { message: err.message, stacktrace: err.stack });
});

// load views folder
app.engine('hbs', exphbs.engine({ extname: 'hbs', })); // .handlebars = .hbs
app.set('view engine', 'hbs');

export { app as tg };
