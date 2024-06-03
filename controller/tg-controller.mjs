import * as model from "../model/postgres/tg-model-postgres.mjs";

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
    "menuOptionOwned",
    "menuOptionLogout",
    "languageList",
];


const getLocalizedUIStrings = (req, keys) => {
    const localizedStrings = {};
    keys.forEach((key) => {
        localizedStrings[key] = req.__(key);
    });
    return localizedStrings;
};


// give all the needed place info to the map page
export async function map(req, res, next) {
    try {
        const places = await model.getAllPlaces();

        const keys = [
            "titleMap",
            "filtersPopupText",
            "foodFilterOption",
            "beachFilterOption",
            "StayingFilterOption",
            "FunFilterOption",
            "SightsFilterOption",
            "AidFilterOption",
        ].concat(commonLocalizedUIStringsKeys);
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

        res.render("map", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleMap"],
            //languages: localizedUIStrings["languageList"],
            pageSpecificCSS: "/css/map.css",
            locale: req.getLocale(),
            places: JSON.stringify(places),
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
        const keys = [
            "titleInfo",
            "introInfo",
            "infoAncientTitle",
            "infoAncient",
            "infoMedievalTitle",
            "infoMedieval",
            "infoModernTitle",
            "infoModern",
        ].concat(commonLocalizedUIStringsKeys);
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

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
        const keys = [
            "titleContact",
            "introContact",
            "name",
            "contactInformation",
            "email",
            "contactMessage",
            "sendMessage",
        ].concat(commonLocalizedUIStringsKeys);
        const localizedUIStrings = getLocalizedUIStrings(req, keys);
        res.render("contact", {
            ...localizedUIStrings,
            lastName: "Last Name",
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

// give all needed info to the bookmarks page
export async function listAllBookmarksRender(req, res, next) {
    const userId = req.session.loggedUserId;
    try {
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks", "dateAdded", "NoBookmarksYet"].concat(
            commonLocalizedUIStringsKeys
        );
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

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
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks", "dateAdded", "NoBookmarksYet"].concat(
            commonLocalizedUIStringsKeys
        );
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

        res.render("bookmarks", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleBookmarks"],
            pageSpecificCSS: "/css/bookmarks.css",
            locale: req.getLocale(),
            bookmarks: bookmarks,
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        if (error.message === "Bookmark already exists") {
            res.render("place", {
                ...localizedUIStrings,
                title: place.name,
                locale: req.getLocale(),
                pageSpecificCSS: "/css/place.css",
                place: place,
                model: process.env.MODEL,
                session: req.session,
                message: "You have already bookmarked this place",
            });
        } else {
            next(error);
        }
    }
}

// remove bookmark page
export async function removeBookmark(req, res, next) {
    const placeId = req.params.placeId;
    const userId = req.session.loggedUserId;

    try {
        await model.removeBookmark(placeId, userId);
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks", "dateAdded", "NoBookmarksYet"].concat(
            commonLocalizedUIStringsKeys
        );
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

        res.render("bookmarks", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleBookmarks"],
            locale: req.getLocale(),
            pageSpecificCSS: "/css/bookmarks.css",
            bookmarks: bookmarks,
            model: process.env.MODEL,
            session: req.session,
            message: "Bookmark removed",
        });
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
            place.images = place.markerImage.split(", ");
            const keys = ["backToMap", "AddToBookmarks"].concat(
                commonLocalizedUIStringsKeys
            );
            const localizedUIStrings = getLocalizedUIStrings(req, keys);
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
        const keys = ["titleOwned", "NoOwnerYet"].concat(
            commonLocalizedUIStringsKeys
        );
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

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
