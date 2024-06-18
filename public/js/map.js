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

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

async function loadPlacesOnMap(displayedCategories) {

    globalMarkersLayer.clearLayers();

    const markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
    });

    const placePhotoDirectory = "/images/";
    places.forEach((place) => {
        let id = place.place_id;
        let name = place.place_name;
        //let description = place.description;
        let latitude = place.latitude;
        let longitude = place.longitude;
        let category = place.category_name;

        let photo_paths = place.photos ? place.photos.split(", ") : ["background-image-2.jpg","background-image-1.jpg"];
        for (let i = 0; i < photo_paths.length; i++) {
            photo_paths[i] = placePhotoDirectory + photo_paths[i]
        }

        let keywords = place.keywords
            ? place.keywords.split(", ").join(", ")
            : "";

        if (displayedCategories.includes(category)) {
            let innerHTML = `
                <div class="swiper">
                    <div class="swiper-wrapper">
                        ${photo_paths
                            .map((image) => {
                                return `<div class="swiper-slide"><img class="popup-image" src="${image}" alt="${name}"></div>`;
                            })
                            .join("")}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
                <div class="popup-text">
                    <div>${name}</div>
                    <div>${keywords}</div>
                </div>
                `;

            let newMarker = L.marker([latitude, longitude])
                .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false })
                .on('popupopen', function() {
                    new Swiper('.swiper',{
                        direction: "horizontal",
                        loop: true,
                        autoplay: {
                            delay: 3000,
                        },
                        pagination: {
                            el: ".swiper-pagination",
                        },
                        allowTouchMove: true,
                    });
                });
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
