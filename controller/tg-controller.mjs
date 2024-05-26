import * as model from '../model/postgres/tg-model-postgres.mjs';

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
      const places = await model.getAllPlaces();
      res.render('map', { places: JSON.stringify(places), model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function placeInfo(req, res, next) {
   const placeId = req.params.placeId;
   try {
      const place = await model.getPlace(placeId);
      if (place) {
         // Assuming markerImage contains comma-separated image paths
         place.images = place.markerImage.split(', '); 
         //place.images = place.markerImage.split(',').map(image => image.trim());
         res.render('place', { place: place, model: process.env.MODEL, session: req.session });
      } else {
         res.status(404).send('Place not found');
      }
   } catch (error) {
      next(error);
   }
}

export async function listOwnedPlaces(req, res, next) {
   const userId = req.session.loggedUserId;
   try {
       const ownedPlaces = await model.getOwnedPlaces(userId);
       res.render('owned', { ownedPlaces, model: process.env.MODEL, session: req.session });
   } catch (error) {
       next(error);
   }
}