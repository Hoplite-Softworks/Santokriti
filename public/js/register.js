document.addEventListener("DOMContentLoaded", function() {
    var signInForm = document.getElementById("signInForm");
    var registrationForm = document.getElementById("registrationForm");
    var toggleSignIn = document.getElementById("toggleSignIn");
    var toggleRegistration = document.getElementById("toggleRegistration");

    toggleSignIn.addEventListener("click", function(event) {
        event.preventDefault();
        signInForm.style.display = "block";
        registrationForm.style.display = "none";
    });

    toggleRegistration.addEventListener("click", function(event) {
        event.preventDefault();
        signInForm.style.display = "none";
        registrationForm.style.display = "block";
    });
});
