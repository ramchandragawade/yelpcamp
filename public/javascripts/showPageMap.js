mapboxgl.accessToken = mapboxtoken;
const campGeo = JSON.parse(campGeometry)
const coords = campGeo && campGeo.coordinates;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: coords, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker({ color: 'black', rotation: 45 })
.setLngLat(coords)
.setPopup(new mapboxgl.Popup({offset:25})
.setHTML(`<h6 class="mt-2 mb-1 me-3 lh-1">${campTitle}</h6>
<p class="mb-1 mt-1 text-muted">${campLocation}</p>`))
.addTo(map);