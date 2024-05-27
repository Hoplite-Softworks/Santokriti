import session from 'express-session'

// set up session middleware with specified options
let tgSession = session({
    secret: 'έναμεγάλοτυχαίοαλφαριθμητικό', // secret key for signing session ID cookies
    cookie: { maxAge: 600 * 1000 }, // session cookie expiration time in ms (600 sec = 10 min)
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create a session until something is stored
});

export default tgSession; // export session middleware for use in the app