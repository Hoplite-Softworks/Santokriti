const checkboxes = document.querySelectorAll("input");
const images = document.querySelectorAll(".places");

checkboxes.forEach(function (checkbox, index) {
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      images[index].style.display = "block";
    } else {
      images[index].style.display = "none";
    }
  });
});
