import express from 'express';
const router = express.Router();

import * as tgController from '../controller/tg-controller.mjs';

//Για την υποστήριξη σύνδεσης/αποσύνδεσης χρηστών
import * as logInController from '../controller/login-controller-password.mjs';

//Καταχώριση συμπεριφοράς σε διάφορα path
router.route('/').get((req, res, next) => {
    //throw new Error('Panos Lelakis 1083712 :)'); 
    res.redirect('/login');
});

router.get('/bookmarks/remove/:placeId', logInController.checkAuthenticated, tgController.removeBookmark);
router.get('/bookmarks', logInController.checkAuthenticated, tgController.listAllBookmarksRender);
router.get('/bookmarks/add/:placeId', logInController.checkAuthenticated, tgController.addBookmark);

//Αιτήματα για σύνδεση
//Δείξε τη φόρμα σύνδεσης.
router.route('/login').get(logInController.showLogInForm);

// // //Αυτή η διαδρομή καλείται όταν η φόρμα φτάσει στον εξυπηρετητή με POST στο /login. Διεκπεραιώνει τη σύνδεση (login) του χρήστη
router.route('/login').post(logInController.doLogin);

// //Αποσυνδέει το χρήστη
router.route('/logout').get(logInController.doLogout);

// //Εγγραφή νέου χρήστη
router.route('/register').get(logInController.showRegisterForm);

router.post('/register', logInController.doRegister);

router.get('/info', tgController.info);

router.get('/contact', tgController.contact);

router.get('/map', tgController.map);

export default router;