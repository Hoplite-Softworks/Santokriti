/**
 * Είναι ο controller για τη σελίδα που δημιουργείται με το ./view/bookmarks.hbs
 *
 * Η tasks αλλάζει τα περιεχόμενά της στέλνοντας αιτήματα HTTP στον εξυπηρετητή.
 *
 */
//import { Bookmark as MyBookmark } from '../model/bookmark.js';
import * as model from '../model/sqlite-async/tg-model-sqlite-async.mjs';

export async function listAllBookmarksRender(req, res, next) {
   const userId = req.session.loggedUserId;
   try {
      const bookmarks = await model.getAllBookmarksWithPlaces(userId);
      res.render('bookmarks', { bookmarks: bookmarks, model: process.env.MODEL, session: req.session });
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
      res.render('bookmarks', { bookmarks: bookmarks, model: process.env.MODEL, session: req.session });
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
      res.render('bookmarks', { bookmarks: bookmarks, model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function info(req, res, next) {
   try {
      res.render('info', { model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function contact(req, res, next) {
   try {
      res.render('contact', { model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function map(req, res, next) {
   try {
      res.render('map', { model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}