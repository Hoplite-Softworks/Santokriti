import bcrypt from "bcrypt";

//import * as userModel from "../model/postgres/tg-model-postgres.mjs";
import * as userModel from "../model-old/sqlite-async/tg-model-sqlite-async.mjs";

const commonLocalizedUIStringsKeys = [
    "islandName",
    "islandSlogan",
    "menuText",
    "menuOptionMap",
    "menuOptionInfo",
    "menuOptionContact",
    "menuOptionBookmarks",
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
        "username",
        "password",
        "login",
        "noAccountYet",
        "register",
    ]);

    res.render("login", {
        ...localizedUIStrings,
        title: localizedUIStrings["titleLogin"],
        pageSpecificCSS: "/css/sign-in.css",
        locale: req.getLocale(),
        model: process.env.MODEL,
    });
};

export let showRegisterForm = function (req, res) {
    const localizedUIStrings = getLocalizedUIStrings(req, [
        "titleRegister",
        "register",
        "password",
        "email",
        "telephone",
        "shopKeeperQuestion",
        "country",
        "alreadyAccount",
        "login",
        "introRegister",
    ]);

    res.render("register", {
        ...localizedUIStrings,
        title: localizedUIStrings["titleRegister"],
        pageSpecificCSS: "/css/sign-in.css",
        locale: req.getLocale(),
        model: process.env.MODEL,
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
                "password",
                "email",
                "telephone",
                "shopKeeperQuestion",
                "country",
                "alreadyAccount",
                "login",
                "introRegister",
            ]);

            res.render("register", {
                ...localizedUIStrings,
                title: localizedUIStrings["titleRegister"],
                pageSpecificCSS: "/css/sign-in.css",
                message: registrationResult.message,
                locale: req.getLocale(),
                model: process.env.MODEL,
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("registration error: " + error);
        //FIXME: δε θα έπρεπε να περνάμε το εσωτερικό σφάλμα στον χρήστη
        res.render("register", { message: error });
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleRegister",
            "register",
            "password",
            "email",
            "telephone",
            "shopKeeperQuestion",
            "country",
            "alreadyAccount",
            "login",
            "messageRegistrationError",
            "introRegister",
        ]);

        res.render("register", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleRegister"],
            pageSpecificCSS: "/css/sign-in.css",
            message: localizedUIStrings["messageRegistrationError"],
            locale: req.getLocale(),
            model: process.env.MODEL,
        });
    }
};

export let doLogin = async function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated

    const user = await userModel.getUserByEmail(req.body.email);
    if (user == undefined || !user.password || !user.userId) {
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleLogin",
            "introLogin",
            "username",
            "password",
            "login",
            "noAccountYet",
            "register",
            "messageNoUserFound",
        ]);
        res.render("login", {
            ...localizedUIStrings,
            message: localizedUIStrings["messageNoUserFound"],
            title: localizedUIStrings["titleLogin"],
            pageSpecificCSS: "/css/sign-in.css",
            locale: req.getLocale(),
            model: process.env.MODEL,
        });
    } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            //if (req.body.password == user.password) {
            //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
            req.session.loggedUserId = user.userId;
            //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/"
            // res.redirect("/");
            const redirectTo = req.session.originalUrl || "/bookmarks";

            res.redirect(redirectTo);
        } else {
            const localizedUIStrings = getLocalizedUIStrings(req, [
                "titleLogin",
                "introLogin",
                "username",
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
                pageSpecificCSS: "/css/sign-in.css",
                locale: req.getLocale(),
                model: process.env.MODEL,
            });
        }
    }
};

export let doLogout = (req, res) => {
    //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
    req.session.destroy();
    res.redirect("/");
};

//Τη χρησιμοποιούμε για να ανακατευθύνουμε στη σελίδα /login όλα τα αιτήματα από μη συνδεδεμένους χρήστες
export let checkAuthenticated = function (req, res, next) {
    //Αν η μεταβλητή συνεδρίας έχει τεθεί, τότε ο χρήστης είναι συνεδεμένος
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    } else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if (req.originalUrl === "/login" || req.originalUrl === "/register") {
            next();
        } else {
            //Στείλε το χρήστη στη "/login"
            console.log("not authenticated, redirecting to /login");
            res.redirect("/login");
        }
    }
};
