let L = window.L;

let map = L.map("map", {
    //dragging: false,
    //zoomControl: false,
}).setView([36.261039, 22.987658], 11);

let baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    //minZoom: 11,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var popup = L.popup();

async function loadPlacesOnMap() {
    const markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
    });

    places.forEach((place) => {
        let id = place.placeId;
        let name = place.name;
        let description = place.description;
        let latitude = place.lat;
        let longitude = place.lng;
        let markerImages = place.markerImage.split(', '); // Assuming images are stored as comma-separated values
        let keywords = place.keywords ? place.keywords.split(", ").join(", ") : '';
        
        // Creating the carousel HTML
        let innerHTML = `
            <div class="carousel">
                ${markerImages.map(img => `<div><img src="${img}" alt="${name}" style="max-width: 100px; max-height: 100px;"></div>`).join('')}
            </div>
            <div class="marker-text">
                <div>${name}</div>
                <div>${keywords}</div>
                
            </div>
        `;

        let newMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false });

        markers.addLayer(newMarker);

        let hoverTimeout;
        // Add mouseover and mouseout events to keep popup open
        newMarker.on('mouseover', function (e) {
            hoverTimeout = setTimeout(() => {
                newMarker.openPopup();
                $('.carousel').slick({
                    autoplay: true,
                    dots: true,
                    autoplaySpeed: 1 * 1000, // each image lasts 1000 ms = 1 sec
                });
            }, 0.4 * 1000); // 1 second
        });
        
        newMarker.on('mouseout', function (e) {
            clearTimeout(hoverTimeout);
            newMarker.closePopup();
        });
        
        newMarker.on('click', function (e) {
            window.location.href = `/place/${id}`;

        });

    });

    map.addLayer(markers);
    markers.on("clusterclick", function (e) {
        console.log("hehe");
        let clusterLatLng = markers.getVisibleParent(e.layer).getLatLng();
        popup
        .setLatLng(clusterLatLng)
        .setContent("You clicked the map at " + clusterLatLng)
        .openOn(map);
    });
}

// load places
loadPlacesOnMap();