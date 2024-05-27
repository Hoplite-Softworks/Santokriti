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
    "menuOptionLogout",
];


const getLocalizedUIStrings = (req, keys) => {
    const localizedStrings = {};
    keys.concat(commonLocalizedUIStringsKeys).forEach((key) => {
        localizedStrings[key] = req.__(key);
    });
    return localizedStrings;
};

// login form
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

// registration form
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

// register new user
export let doRegister = async function (req, res) {
    // checks if a user exists by the given email
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

// login user
export let doLogin = async function (req, res) {
    // checks if username and password are correct
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
            // loggedUserId and isShopKeeper are used in session (eg in navbar)
            req.session.loggedUserId = user.userId;
	        req.session.isShopKeeper = user.isShopKeeper;
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

// logout user
export let doLogout = (req, res) => {
    // user isn't logged in anymore
    req.session.destroy();
    res.redirect('/');
}

// check if user is logged in
export let checkAuthenticated = function (req, res, next) {
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        next();
    }
    else {
        // user isn't logged in, so he is prompted to do so
        if ((req.originalUrl === "/login") || (req.originalUrl === "/register")) {
            next()
        }
        else {
            // redirect the user to the login page
            console.log("not authenticated, redirecting to /login")
            res.redirect('/login');
        }
    }
}

// check if the logged in (or not) user is a shop keeper
export let checkShopKeeper = function (req, res, next) {
    if (req.session.isShopKeeper) {
        next();
    } else {
        res.render('contact', { message: 'You must be a shopkeeper to access the owned page. Contact the developers if you want to apply as a shopkeeper.' });
    }
}