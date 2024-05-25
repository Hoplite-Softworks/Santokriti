let L = window.L;

let map = L.map("map", {
    //dragging: false,
    //zoomControl: true,
}).setView([36.261039, 22.987658], 11);

let baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    minZoom: 11,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var popup = L.popup();

async function loadPlacesOnMap() {
    //const places = await fetchPlaces();
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
        let markerImage = place.markerImage;
        let keywords = place.keywords ? place.keywords.split(", ").join(", ") : '';
        let innerHTML = `
        <img class="marker-image" src="${markerImage}">
        <div class="marker-text">
        <div>${name}</div>
        <div>${keywords}</div>
        <a href="/place/${id}">More Info</a>
        </div>`;

        let newMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false });

        markers.addLayer(newMarker);

        //
        // Add hover functionality
        /*let hoverTimeout;
        newMarker.on('mouseover', function (e) {
            hoverTimeout = setTimeout(() => {
                newMarker.openPopup();
            }, 1 * 1000); // 1 second
        });
        
        newMarker.on('mouseout', function (e) {
            clearTimeout(hoverTimeout);
            newMarker.closePopup();
        });
        
        newMarker.on('click', function (e) {
            window.location.href = `/place/${id}`;
        });*/

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

/*
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on("click", onMapClick);*/
