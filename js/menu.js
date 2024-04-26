function toggleContent(categoryId) {
    var content = document.getElementById(categoryId + "-content");
    if (content.style.display === "none") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}
