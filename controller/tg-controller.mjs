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
      const bookmarks = await model.getAllBookmarks(userId);
      res.render('bookmarks', { bookmarks: bookmarks, model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function addBookmark(req, res, next) {
   const userId = req.session.loggedUserId;
   const { placeId } = req.body;
   try {
      await model.addBookmark(userId, placeId);
      const allBookmarks = await model.getAllBookmarks(userId);
      res.render('bookmarks', { bookmarks: allBookmarks, model: process.env.MODEL, session: req.session });
  } catch (error) {
      next(error);
  }
}

export async function removeBookmark(req, res, next) {
   const placeId = req.params.placeId;
   const userId = req.session.loggedUserId;
   try {
      model.removeBookmark(placeId, userId);
      const allBookmarks = await model.getAllBookmarks(userId);
      res.render('bookmarks', { bookmarks: allBookmarks, model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}
