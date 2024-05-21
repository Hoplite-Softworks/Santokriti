export async function listHome(req, res, next) {
   const userId = req.session.loggedUserId;
   try {
      res.render('home', {title: "Home"});
   } catch (error) {
      next(error);
   }
}
