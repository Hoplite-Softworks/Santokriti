let L = window.L;

let map = L.map("map", {
    dragging: true,
    zoomControl: true,
    maxBounds: [
        [36.076162, 22.804711], // South West coordinates of Kythera
        [36.415831, 23.203361], // North East coordinates of Kythera
    ],
}).setView([36.261039, 22.987658], 11);


let baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    minZoom: 11,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let globalMarkersLayer = L.layerGroup().addTo(map);

var popup = L.popup();
var $jq = jQuery.noConflict();

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const swiper = new Swiper(".swiper", {
    direction: "vertical",
    loop: true,
    autoplay: {
        delay: 3000,
    },
    pagination: {
        el: ".swiper-pagination",
    },
});


async function loadPlacesOnMap(displayedCategories) {

    globalMarkersLayer.clearLayers();

    const markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
    });

    places.forEach((place) => {
        let id = place.place_id;
        let name = place.place_name;
        //let description = place.description;
        let latitude = place.latitude;
        let longitude = place.longitude;
        let category = place.category_name;
        let markerImages = [
            "images/background-image-2.jpg",
            "images/background-image-1.jpg",
        ]; //place.markerImage.split(', '); // Assuming images are stored as comma-separated values
        let keywords = place.keywords
            ? place.keywords.split(", ").join(", ")
            : "";

        if (displayedCategories.includes(category)) {
            // Creating the carousel HTML
            let innerHTML = `
                <!-- Slider main container -->
                <div class="swiper">
                <!-- Additional required wrapper -->
                    <div class="swiper-wrapper">
                        <!-- Slides -->
                        ${markerImages
                            .map((image) => {
                                return `<div class="swiper-slide"><img class="popup-image" src="${image}" alt="${name}" style="width: 100%"></div>`;
                            })
                            .join("")}
                    </div>      
                </div>
                <div class="popup-text">
                    <div>${name}</div>
                    <div>${keywords}</div>
                </div>
                `;

            let newMarker = L.marker([latitude, longitude])
                .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false });
            markers.addLayer(newMarker);

            if (isMobile) {
                //let popupOpened = false;
                newMarker.on("click", function (e) {
                    newMarker.openPopup();
                });

                newMarker.on("popupopen", function (e) {
                    $(".leaflet-popup-content-wrapper").on(
                        "click",
                        function (ev) {
                            ev.stopPropagation();
                            window.location.href = `/place/${id}`;
                        }
                    );
                });
            } else {
                let hoverTimeout;
                // Add mouseover and mouseout events to keep popup open
                newMarker.on("mouseover", function (e) {
                    hoverTimeout = setTimeout(() => {
                        newMarker.openPopup();
                    }, 0.4 * 1000); // 1 second
                });

                newMarker.on("mouseout", function (e) {
                    clearTimeout(hoverTimeout);
                    newMarker.closePopup();
                });

                newMarker.on("click", function (e) {
                    window.location.href = `/place/${id}`;
                });
            }
        }
    });

    globalMarkersLayer.addLayer(markers);
    markers.on("clusterclick", function (e) {
        //console.log("hehe");
        let clusterLatLng = markers.getVisibleParent(e.layer).getLatLng();
        map.panTo(clusterLatLng);
    });
}

async function loadCategoriesOnMap() {
    categories.forEach((category) => {
        let name = category.name;

        document.getElementById("floating-container").innerHTML += `
        <div>
            <input class="category-checkbox" id="${name}" type="checkbox" checked="true"/>
            <label for="${name}">${name}</label>
        </div>
        `;
        
    });
}

//reloadPlacesOnMap();

function addListenersToCategories() {
    const checkboxes = document.getElementsByClassName("category-checkbox")
    Array.from(checkboxes).forEach((checkbox) => {
        checkbox.addEventListener("click", function () {
            // Perform the desired action
            if (checkbox.checked) {
                categoriesList.push(checkbox.id);
                loadPlacesOnMap(categoriesList);
            } else {
                categoriesList = categoriesList.filter((item) => item !== checkbox.id)
                loadPlacesOnMap(categoriesList);
            }
        });
    })
}

let categoriesList = categories.map((category) => category.name);

loadCategoriesOnMap();
addListenersToCategories();
loadPlacesOnMap(categoriesList);
