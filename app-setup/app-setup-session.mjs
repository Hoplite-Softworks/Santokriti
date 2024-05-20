import session from 'express-session'

let tg = session({
    secret: 'έναμεγάλοτυχαίοαλφαριθμητικό',
    cookie: { maxAge: 600 * 1000 },
    resave: false,
    saveUninitialized: false,
});

export default tg;
