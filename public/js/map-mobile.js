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
        //let markerImages = place.markerImage.split(',').map(image => image.trim());
        let keywords = place.keywords ? place.keywords.split(", ").join(", ") : '';
        
        //let imageSlides = markerImages.map(image => `<div><img class="marker-image" src="${image}"></div>`).join('');
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
        //<a href="/place/${id}">More Info</a>

        let newMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(innerHTML, { maxWidth: "auto", closeButton: false });

        markers.addLayer(newMarker);

        //let hoverTimeout;
        // Add mouseover and mouseout events to keep popup open
        //newMarker.on('mouseover', function (e) {
            //hoverTimeout = setTimeout(() => {
                //newMarker.openPopup();
                //$('.carousel').slick({
                    //autoplay: true,
                    //dots: true,
                //});
            //}, 1.5 * 1000); // 1.5 second
        //});
        
        //newMarker.on('mouseout', function (e) {
            //clearTimeout(hoverTimeout);
            //newMarker.closePopup();
        //});
        
        //newMarker.on('click', function (e) {
            //window.location.href = `/place/${id}`;
        //});

        // Open popup on marker click (for PC)
        let popupOpened = false;
        newMarker.on('touchstart click', function (e) {
            console.log('TAP');
            if (!popupOpened) {
                newMarker.openPopup();
                popupOpened = true;
            }
        });

        newMarker.on('popupopen', function (e) {
            console.log('TAP');
            let popupContent = e.popup.getContent();
            
    $(popupContent).find('.leaflet-popup-content-wrapper').on('click touchstart', function (event) {
        console.log('Clicked inside popup');
        event.stopPropagation(); // Prevent click event from propagating to the map
        // Take user to place page
        window.location.href = `/place/${id}`;
    });

    // Close the popup when tapping outside the content
    $(document).on('click touchstart', function (event) {
        if (!$(event.target).closest('.leaflet-popup').length) {
            newMarker.closePopup();
        }
    });
        });

        // Open popup on marker touchstart (for mobile)
        //newMarker.on('touchstart', function (e) {
            //newMarker.openPopup();
        //});

        //let tapCount = 0;
        //newMarker.on('touchstart', function (e) {
            //console.log('TAP');
            //tapCount++;
            //if (tapCount === 1) {
                // First tap, open the popup
                //newMarker.togglePopup();
                //$('.carousel').slick({
                    //autoplay: true,
                    //dots: true,
                //});
            //} else {
                // Second tap, redirect to place page
                //window.location.href = `/place/${id}`;
                //newMarker.togglePopup();
            //}
        //});

        // Add click/touch event to popup content to navigate to place page
        //newMarker.on('popupopen', function (e) {
            //let popupContent = e.popup.getContent();
            //$(popupContent).find('.carousel').on('click touchstart', function () {
                //let placeId = $(this).closest('.leaflet-popup-content').data('place-id');
                //window.location.href = `/place/${placeId}`;
            //});
        //});
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
