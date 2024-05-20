import express from 'express'
const app = express()

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import exphbs from 'express-handlebars'

//Χρειάζεται για το χειρισμό των αιτημάτων που έρχονται με POST
//(extended:false σημαίνει πως δε χρειαζόμαστε να διαβάσουμε εμφωλευμένα αντικείμενα που έχουν έρθει με το αίτημα POST)
app.use(express.urlencoded({ extended: false }));

import tgSession from './app-setup/app-setup-session.mjs';
//Ενεργοποίηση συνεδρίας
app.use(tgSession);

//Το template μας μπορεί να χρειάζεται να φορτώσει κάποια CSS ή JS
//Δηλώνουμε πως θα βρίσκονται στον φάκελο /public
//Για παράδειγμα το /views/layouts/layout.hbs φορτώνει αρχεία με αυτό τον τρόπο, π.χ.
//το αρχείο στο φάκελο /public/style.css μπορεί να φορτωθεί με 
//http://localhost:PORT/style.css
app.use(express.static('public'))

//Σε κάθε request περνάμε στην ιδιότητα "locals" του response object την τιμή
//του loggedUserId. Η res.locals.userId είναι προσβάσιμη από το hbs ως `userId`
//Γενικά όλα τα μέλη του αντικειμένου res.locals είναι προσβάσιμα στη μηχανή template.
//(http://expressjs.com/en/api.html#res.locals)
app.use((req, res, next) => {
    if (req.session) {
       res.locals.userId = req.session.loggedUserId;
    } else {
       res.locals.userId = 'επισκέπτης';
    }
    next();
 });

//Διαδρομές. Αντί να γράψουμε τις διαδρομές μας εδώ, τις φορτώνουμε από ένα άλλο αρχείο
import routes from './routes/task-list-routes.mjs';
//και τώρα χρησιμοποιούμε αυτές τις διαδρομές
app.use('/', routes);

//Error Handler
app.use((err, req, res, next) => {
   if (res.headersSent) {
      return next(err);
   }
   res.status(500);
   res.render('error', { message: err.message, stacktrace: err.stack });
});

//Χρήση των views
//Σημ.: η engine πρέπει να έχει ίδιο όνομα με το extname, αλλιώς δεν θα
//αναγνωριστεί το extname (αν δεν το κάνουμε αυτό, απλά τα αρχεία handlebars θα πρέπει να
///τελειώνουν με .handlebars)
app.engine(
    'hbs',
    exphbs.engine({
       extname: 'hbs',
    })
 );
 //και ορίζουμε πως θα χρησιμοποιήσουμε τη μηχανή template με όνομα 'hbs'
 app.set('view engine', 'hbs');

export { app as tg };