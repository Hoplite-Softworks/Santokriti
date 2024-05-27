import express from 'express';
const router = express.Router();

import * as tgController from '../controller/tg-controller.mjs';
import * as logInController from '../controller/login-controller-password.mjs';

// main path
router.route('/').get((req, res, next) => {
    res.redirect('/map');
});

router.get('/bookmarks/remove/:placeId', logInController.checkAuthenticated, tgController.removeBookmark);
router.get('/bookmarks', logInController.checkAuthenticated, tgController.listAllBookmarksRender);
router.get('/bookmarks/add/:placeId', logInController.checkAuthenticated, tgController.addBookmark);

router.get('/owned', logInController.checkAuthenticated, logInController.checkShopKeeper, tgController.listOwnedPlaces);

router.route('/login').get(logInController.showLogInForm);

// after receiving POST from the login form
router.route('/login').post(logInController.doLogin);

router.route('/logout').get(logInController.doLogout);

router.route('/register').get(logInController.showRegisterForm);

router.post('/register', logInController.doRegister);

router.get('/info', tgController.info);

router.get('/contact', tgController.contact);

router.get('/map', tgController.map);

router.get('/place/:placeId', tgController.placeInfo);

export default router;