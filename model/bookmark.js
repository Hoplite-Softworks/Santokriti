//Δημιουργός (constructor) ενός αντικειμένου τύπου Task
//Αν περαστεί ένα μόνο όρισμα, τότε τα άλλα δύο 
//status=0 σημαίνει η εργασία είναι ενεργή, 1 σημαίνει έχει ολοκληρωθεί 
//Για να δημιουργηθεί ένα νέο αντικείμενο καλείται με const newTask = new Task('Περιγραφή μιας εργασίας');
exports.Bookmark = function (bookmarkId, date = '', userId, placeId) {
    this.bookmarkId = bookmarkId
    this.date = date
    this.userId = userId
    this.placeId = placeId
}