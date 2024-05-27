import session from 'express-session'

let tgSession = session({
    secret: 'έναμεγάλοτυχαίοαλφαριθμητικό', // secret key
    cookie: { maxAge: 600 * 1000 }, // timeout = 600 sec = 10 min
    resave: false,
    saveUninitialized: false,
});

export default tgSession;