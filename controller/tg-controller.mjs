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
    keys.forEach((key) => {
        localizedStrings[key] = req.__(key);
    });
    return localizedStrings;
};

export async function home(req, res, next) {
    const userId = req.session.loggedUserId;
    try {
        const places = await model.getAllPlaces();

        const keys = [
            "titleHome",
            "filtersPopupText",
            "foodFilterOption",
            "beachFilterOption",
            "StayingFilterOption",
            "FunFilterOption",
            "SightsFilterOption",
            "AidFilterOption",
        ].concat(commonLocalizedUIStringsKeys);
        const localizedUIStrings = getLocalizedUIStrings(req, keys);

        res.render("home", {
            ...localizedUIStrings,
            title: localizedUIStrings["titleHome"],
            pageSpecificCSS: "/css/home.css",
            locale: req.getLocale(),
            places: JSON.stringify(places),
            model: process.env.MODEL,
            session: req.session,
        });
    } catch (error) {
        next(error);
    }
}

/*
 
 */
//import { Bookmark as MyBookmark } from '../model/bookmark.js';
import * as model from "../model/sqlite-async/tg-model-sqlite-async.mjs";

export async function listAllBookmarksRender(req, res, next) {
    const userId = req.session.loggedUserId;
    try {
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks"].concat(commonLocalizedUIStringsKeys);
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
    console.log(placeId);
    try {
        await model.addBookmark(userId, placeId);
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks"].concat(commonLocalizedUIStringsKeys);
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
        next(error);
    }
}

export async function removeBookmark(req, res, next) {
    const placeId = req.params.placeId;
    const userId = req.session.loggedUserId;
    console.log(placeId);
    try {
        await model.removeBookmark(placeId, userId);
        const bookmarks = await model.getAllBookmarksWithPlaces(userId);

        const keys = ["titleBookmarks"].concat(commonLocalizedUIStringsKeys);
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

export async function contact(req, res, next) {
    try {
        const keys = [
            "titleContact",
            "introContact",
            "name",
            "firstName",
            "contactInformation",
            "telephone",
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

export async function placeInfo(req, res, next) {
    const placeId = req.params.placeId;
    try {
        const place = await model.getPlace(placeId);
        if (place.length > 0) {
            const keys = ["backToMap"].concat(commonLocalizedUIStringsKeys);
            const localizedUIStrings = getLocalizedUIStrings(req, keys);
            res.render("place", {
                ...localizedUIStrings,
                title: place[0].name,
                locale: req.getLocale(),
                pageSpecificCSS: "/css/place.css",
                place: place[0],
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
