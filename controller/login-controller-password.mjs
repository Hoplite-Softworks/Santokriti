import bcrypt from "bcrypt";
import * as userModel from "../model/postgres/tg-model-postgres.mjs";

export const commonLocalizedUIStringsKeys = [
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
    "languageList",
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
        model: process.env.MODEL,
    });
};

export let showRegisterForm = function (req, res) {
    const localizedUIStrings = getLocalizedUIStrings(req, [
        "titleRegister",
        "register",
        "firstName",
        "lastName",
        "password",
        "email",
        "telephone",
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
        model: process.env.MODEL,
    });
};

export let doRegister = async function (req, res) {
    try {
        const registrationResult = await userModel.registerUser(
            req.body.firstName,
            req.body.lastName,
            req.body.password,
            req.body.email,
            req.body.isShopKeeper,
            req.body.telephone,
        );
        if (registrationResult.message) {
            const localizedUIStrings = getLocalizedUIStrings(req, [
                "titleRegister",
                "register",
                "firstName",
                "lastName",
                "password",
                "email",
                "isShopKeeper",
                "telephone",
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
                model: process.env.MODEL,
            });
        } else {
            res.redirect("/login?message=Successful%20registration");
        }
    } catch (error) {
        console.error("registration error: " + error);
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleRegister",
            "register",
            "firstName",
            "lastName",
            "password",
            "email",
            "isShopKeeper",
            "telephone",
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
            model: process.env.MODEL,
        });
    }
};

export let doLogin = async function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated
    const user = await userModel.getUserByEmail(req.body.email);

    if (user == undefined || !user.password || !user.user_id) {
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
            model: process.env.MODEL,
        });
    } else {
        //const match = await bcrypt.compare(req.body.password, user.password);
        const match = req.body.password === user.password;
        if (match) {
            req.session.loggedUserId = user.user_id;
            res.redirect("/bookmarks");
        } else {
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
                message: localizedUIStrings["messageWrongPassword"],
                title: localizedUIStrings["titleLogin"],
                pageSpecificCSS: "/css/login.css",
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
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    } else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if (req.originalUrl === "/login" || req.originalUrl === "/register") {
            next();
        } else {
            //Στείλε το χρήστη στη "/login"
            res.redirect("/login");
        }
    }
};

export let checkShopKeeper = function (req, res, next) {
    if (req.session.isShopKeeper) {
        next();
    } else {
        res.render("contact", {
            message:
                "You must be a shopkeeper to access the owned page. Contact the developers if you want to apply as a shopkeeper.",
        });
    }
};
