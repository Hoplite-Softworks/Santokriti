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
router.route('/').get((req, res) => { res.render("home")});

router.get('/home', tgController.listHome);

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

export default router;
