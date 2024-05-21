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

async function fetchPlaces() {
    const response = await fetch(`../places.json`);
    return response.json();
}

async function loadPlacesOnMap() {
    const places = await fetchPlaces();
    const markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
    });

    places.forEach((place) => {
        let id = place["id"];
        let name = place["name"];
        let description = place["name"];
        let latitude = place["lat"];
        let longtitude = place["long"];
        let markerImage = place["markerImage"];
        let keywords = place["keywords"].join(", ");
        let innerHTML = `<img class="marker-image" src="${markerImage}"><div class="marker-text"><div>${name}</div><div>${keywords}</div></div>`;

        let newMarker = L.marker([latitude, longtitude])
            .addTo(map)
            .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false });

        markers.addLayer(newMarker);
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
