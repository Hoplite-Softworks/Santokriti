import bcrypt from 'bcrypt'
import * as userModel from '../model/postgres/tg-model-postgres.mjs';

const commonLocalizedUIStringsKeys = [
    "islandName",
    "islandSlogan",
    "menuText",
    "menuOptionMap",
    "menuOptionInfo",
    "menuOptionContact",
    "menuOptionBookmarks",
    "menuOptionOwned",
    "menuOptionRegister",
    "menuOptionLogin",
];


const getLocalizedUIStrings = (req, keys) => {
    const localizedStrings = {};
    keys.concat(commonLocalizedUIStringsKeys).forEach((key) => {
        localizedStrings[key] = req.__(key);
    });
    return localizedStrings;
};

export let showLogInForm = function (req, res) {
    const localizedUIStrings = getLocalizedUIStrings(req, [
        "titleLogin",
        "introLogin",
        "name",
        "password",
        "login",
        "noAccountYet",
        "register",
        "email",
    ]);

    res.render("login", {
        ...localizedUIStrings,
        title: localizedUIStrings["titleLogin"],
        pageSpecificCSS: "/css/login.css",
        locale: req.getLocale(),
        model: process.env.MODEL
    });
};

export let showRegisterForm = function (req, res) {
    const localizedUIStrings = getLocalizedUIStrings(req, [
        "titleRegister",
        "register",
        "name",
        "password",
        "email",
        "isShopKeeper",
        "country",
        "alreadyAccount",
        "login",
        "introRegister",
    ]);

    res.render("register", {
        ...localizedUIStrings,
        title: localizedUIStrings["titleRegister"],
        pageSpecificCSS: "/css/register.css",
        locale: req.getLocale(),
        model: process.env.MODEL
    });
};

export let doRegister = async function (req, res) {
    try {
        const registrationResult = await userModel.registerUser(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.isShopKeeper
        );
        if (registrationResult.message) {
            const localizedUIStrings = getLocalizedUIStrings(req, [
                "titleRegister",
                "register",
                "name",
                "password",
                "email",
                "isShopKeeper",
                "country",
                "alreadyAccount",
                "login",
                "introRegister",
            ]);

            res.render("register", {
                ...localizedUIStrings,
                title: localizedUIStrings["titleRegister"],
                pageSpecificCSS: "/css/register.css",
                message: registrationResult.message,
                locale: req.getLocale(),
                model: process.env.MODEL
            });
        } else {
            console.log( req.body.name,
                req.body.email,
                req.body.password,
                req.body.isShopKeeper)
            res.redirect('/login?message=Successful%20registration');
        }
    } catch (error) {
        console.error("registration error: " + error);
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleRegister",
            "register",
            "name",
            "password",
            "email",
            "isShopKeeper",
            "country",
            "alreadyAccount",
            "login",
            "messageRegistrationError",
            "introRegister",
        ]);

        res.render("register", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleRegister"],
            pageSpecificCSS: "/css/register.css",
            message: localizedUIStrings["messageRegistrationError"],
            locale: req.getLocale(),
            model: process.env.MODEL
        });
    }
};

export let doLogin = async function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated
    console.log(req.body.email)

    const user = await userModel.getUserByEmail(req.body.email);
    
    console.log(user)
    if (user == undefined || !user.password || !user.userId) {
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleLogin",
            "introLogin",
            "name",
            "password",
            "login",
            "noAccountYet",
            "register",
            "messageNoUserFound",
            "email",
        ]);
        res.render("login", {
            ...localizedUIStrings,
            message: localizedUIStrings["messageNoUserFound"],
            title: localizedUIStrings["titleLogin"],
            pageSpecificCSS: "/css/login.css",
            locale: req.getLocale(),
            model: process.env.MODEL
        });
    } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            //if (req.body.password == user.password) {
            //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
            req.session.loggedUserId = user.userId;
	        req.session.isShopKeeper = user.isShopKeeper;
            //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/"
            // res.redirect("/");
            const redirectTo = req.session.originalUrl || "/bookmarks";

            res.redirect(redirectTo);
        } else {
            const localizedUIStrings = getLocalizedUIStrings(req, [
                "titleLogin",
                "introLogin",
                "name",
                "password",
                "login",
                "noAccountYet",
                "register",
                "messageWrongPassword",
            ]);
            res.render("login", {
                ...localizedUIStrings,
                message: localizedUIStrings["messageWrongPassword"],
                title: localizedUIStrings["titleLogin"],
                pageSpecificCSS: "/css/login.css",
                locale: req.getLocale(),
                model: process.env.MODEL
            });
        }
    }
};

export let doLogout = (req, res) => {
    //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
    req.session.destroy();
    res.redirect('/');
}

//Τη χρησιμοποιούμε για να ανακατευθύνουμε στη σελίδα /login όλα τα αιτήματα από μη συνδεδεμένους χρήστες
export let checkAuthenticated = function (req, res, next) {
    //Αν η μεταβλητή συνεδρίας έχει τεθεί, τότε ο χρήστης είναι συνεδεμένος
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    }
    else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if ((req.originalUrl === "/login") || (req.originalUrl === "/register")) {
            next()
        }
        else {
            //Στείλε το χρήστη στη "/login" 
            console.log("not authenticated, redirecting to /login")
            res.redirect('/login');
        }
    }
}

export let checkShopKeeper = function (req, res, next) {
    if (req.session.isShopKeeper) {
        next();
    } else {
        res.render('contact', { message: 'You must be a shopkeeper to access the owned page. Contact the developers if you want to apply as a shopkeeper.' });
    }
}