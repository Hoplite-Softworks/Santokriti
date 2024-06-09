import * as model from "../model/postgres/tg-model-postgres.mjs";

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


export const getLocalizedUIStrings = (req, keys) => {
    const localizedStrings = {};
    keys.concat(commonLocalizedUIStringsKeys).forEach((key) => {
        localizedStrings[key] = req.__(key);
    });
    return localizedStrings;
};


// give all the needed place info to the map page
export async function map(req, res, next) {
    try {
        const places = await model.getAllPlaces();
        const categories = await model.getAllCategories();
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleMap",
            "filtersPopupText",
        ]);

        res.render("map", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleMap"],
            //languages: localizedUIStrings["languageList"],
            pageSpecificCSS: "/css/map.css",
            locale: req.getLocale(),
            places: JSON.stringify(places),
            categories: JSON.stringify(categories),
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}

// for the info page
export async function info(req, res, next) {
    try {
        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleInfo",
            "introInfo",
            "infoAncientTitle",
            "infoAncient",
            "infoMedievalTitle",
            "infoMedieval",
            "infoModernTitle",
            "infoModern",
        ]);

        res.render("info", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleInfo"],
            pageSpecificCSS: "/css/info.css",
            locale: req.getLocale(),
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}

// for the contact page
export async function contact(req, res, next) {
    try {

        const localizedUIStrings = getLocalizedUIStrings(req, [
            "titleContact",
            "introContact",
            "name",
            "contactInformation",
            "email",
            "contactMessage",
            "sendMessage",
            "firstName",
            "lastName",
        ]);

        res.render("contact", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleContact"],
            pageSpecificCSS: "/css/contact.css",
            locale: req.getLocale(),
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}

export async function sendContactMessage(req, res, next) {

    try {
        if (req.session.loggedUserId) {
            await model.sendUserMessage(
                req.body.message,
                req.session.loggedUserId
            )
        } else {
            await model.sendEmailMessage(
                req.body.message,
                req.body.email,
                req.body.firstName,
                req.body.lastName,
            )
        }

        res.redirect("/contact");
    } catch (error) {
        next(error);
    }
}

// give all needed info to the bookmarks page
export async function listAllBookmarksRender(req, res, next) {

    const userId = req.session.loggedUserId;
    try {
        const bookmarks = await model.getAllBookmarksByUser(userId);
        const localizedUIStrings = getLocalizedUIStrings(req, ["titleBookmarks", "dateBookmarked", "NoBookmarksYet"]);
        bookmarks[0].da = localizedUIStrings["dateBookmarked"];

        res.render("bookmarks", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleBookmarks"],
            locale: req.getLocale(),
            pageSpecificCSS: "/css/bookmarks.css",
            bookmarks: bookmarks,
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}

export async function addBookmark(req, res, next) {
    const placeId = req.params.placeId;
    const userId = req.session.loggedUserId;
    try {
        await model.addBookmark(userId, placeId);
        /*
        const bookmarks = await model.getAllBookmarksByUser(userId);
        const localizedUIStrings = getLocalizedUIStrings(req, ["titleBookmarks", "dateBookmarked", "NoBookmarksYet"]);
        res.render("bookmarks", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleBookmarks"],
            pageSpecificCSS: "/css/bookmarks.css",
            locale: req.getLocale(),
            bookmarks: bookmarks,
            model: process.env.MODEL,
            session: req.session,
        });*/

        res.redirect("/place/" + placeId);
    } catch (error) {
        error.message === "Bookmark already exists"
        next(error);
    }
}

// remove bookmark page
export async function removeBookmark(req, res, next) {
    const placeId = req.params.placeId;
    const userId = req.session.loggedUserId;
    try {
        await model.removeBookmark(placeId, userId);
        /*
        const bookmarks = await model.getAllBookmarksByUser(userId);
        const localizedUIStrings = getLocalizedUIStrings(req, ["titleBookmarks", "dateBookmarked", "NoBookmarksYet"]);
        res.render("bookmarks", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleBookmarks"],
            locale: req.getLocale(),
            pageSpecificCSS: "/css/bookmarks.css",
            bookmarks: bookmarks,
            model: process.env.MODEL,
            session: req.session,
            message: "Bookmark removed",
        });*/

        res.redirect("/place/" + placeId);
    } catch (error) {
        next(error);
    }
}


// give specific place info to the place page
export async function placeInfo(req, res, next) {
    const placeId = req.params.placeId;
    try {
        const place = await model.getPlace(placeId);
        if (place) {
            if (req.session.loggedUserId) {
                place.isBookmarked = await model.isBookmarked(req.session.loggedUserId, placeId);
            } else {
                place.isBookmarked = false;
            }
            const localizedUIStrings = getLocalizedUIStrings(req, ["backToMap", "AddToBookmarks", "RemoveFromBookmarks"]);
            
            res.render("place", {
                ...localizedUIStrings,
                title: place.name,
                locale: req.getLocale(),
                pageSpecificCSS: "/css/place.css",
                place: place,
                model: process.env.MODEL,
                session: req.session,
            });
        } else {
            res.status(404).send("Place not found");
        }
    } catch (error) {
        next(error);
    }
}

// list owned places for an owner
export async function listOwnedPlaces(req, res, next) {
    const userId = req.session.loggedUserId;
    try {
        const localizedUIStrings = getLocalizedUIStrings(req, ["titleOwned", "NoOwnerYet"]);

        const ownedPlaces = await model.getOwnedPlaces(userId);
        res.render("owned", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleOwned"],
            locale: req.getLocale(),
            pageSpecificCSS: "/css/owned.css",
            ownedPlaces: ownedPlaces,
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}
