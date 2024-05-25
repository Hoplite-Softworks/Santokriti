import express from 'express'
const router = express.Router();

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    console.log('loading .env');
    dotenv.config();
}

const tgController = await import(`../controller/tg-controller.mjs`);
const logInController = await import(`../controller/login-controller-password.mjs`);

//Καταχώριση συμπεριφοράς σε διάφορα path
router.route('/').get((req, res) => { res.redirect('/home');});

router.get('/home', tgController.home);

router.get('/place/:placeId', tgController.placeInfo);

router.get('/bookmarks/remove/:placeId', logInController.checkAuthenticated, tgController.removeBookmark);
router.get('/bookmarks', logInController.checkAuthenticated, tgController.listAllBookmarksRender);
router.get('/bookmarks/add/:placeId', logInController.checkAuthenticated, tgController.addBookmark);

router.get('/info', tgController.info);

router.get('/contact', tgController.contact);


//Δείξε τη φόρμα σύνδεσης.
router.route('/login').get(logInController.showLogInForm);

// // //Αυτή η διαδρομή καλείται όταν η φόρμα φτάσει στον εξυπηρετητή με POST στο /login. Διεκπεραιώνει τη σύνδεση (login) του χρήστη
router.route('/login').post(logInController.doLogin);

// //Αποσυνδέει το χρήστη
router.route('/logout').get(logInController.doLogout);

// //Εγγραφή νέου χρήστη
router.route('/register').get(logInController.showRegisterForm);

router.post('/register', logInController.doRegister);


export default router;
